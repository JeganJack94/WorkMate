import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { FaDownload, FaFilter } from 'react-icons/fa';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SYSTEM_TYPES = [
  'Access Control',
  'CCTV',
  'Fire Alarm',
  'PAS'
];

function Reports() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedDoor, setSelectedDoor] = useState('');
  const [floors, setFloors] = useState([]);
  const [doors, setDoors] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Fetch floors when project and system are selected
  useEffect(() => {
    if (selectedProject && selectedSystem) {
      fetchFloors();
    } else {
      setFloors([]);
      setSelectedFloor('');
    }
  }, [selectedProject, selectedSystem]);

  // Fetch doors when floor is selected
  useEffect(() => {
    if (selectedFloor) {
      fetchDoors();
    } else {
      setDoors([]);
      setSelectedDoor('');
    }
  }, [selectedFloor]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, `users/${user.uid}/projects`);
      const snapshot = await getDocs(projectsRef);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchFloors = async () => {
    try {
      const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors`);
      const snapshot = await getDocs(floorsRef);
      const floorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFloors(floorsData);
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  const fetchDoors = async () => {
    try {
      const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${selectedFloor}/doors`);
      const snapshot = await getDocs(doorsRef);
      const doorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDoors(doorsData);
    } catch (error) {
      console.error('Error fetching doors:', error);
    }
  };

  const generateReport = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const project = projects.find(p => p.id === selectedProject);
      let reportData = {
        projectName: project.name,
        client: project.client,
        generatedAt: new Date().toISOString(),
        systems: {},
        statistics: {
          totalFloors: 0,
          totalDoors: 0,
          completedDoors: 0,
          pendingDoors: 0,
          totalPhotos: 0
        }
      };

      // Fetch data based on selected filters
      if (selectedSystem) {
        const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors`);
        const floorsSnapshot = await getDocs(floorsRef);
        const floorsData = [];
        let totalDoors = 0;
        let completedDoors = 0;
        let totalPhotos = 0;

        for (const floorDoc of floorsSnapshot.docs) {
          // Skip if floor is selected and doesn't match
          if (selectedFloor && floorDoc.id !== selectedFloor) continue;

          const floor = {
            id: floorDoc.id,
            ...floorDoc.data(),
            doors: []
          };

          const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floor.id}/doors`);
          const doorsSnapshot = await getDocs(doorsRef);
          
          for (const doorDoc of doorsSnapshot.docs) {
            const doorData = doorDoc.data();
            const completedCheckpoints = doorData.checkpoints.filter(cp => cp.completed).length;
            const totalCheckpoints = doorData.checkpoints.length;
            const photosCount = doorData.checkpoints.filter(cp => cp.photo).length;

            floor.doors.push({
              id: doorDoc.id,
              ...doorData,
              completedCheckpoints,
              totalCheckpoints,
              photosCount
            });

            totalDoors++;
            if (completedCheckpoints === totalCheckpoints) {
              completedDoors++;
            }
            totalPhotos += photosCount;
          }

          floorsData.push(floor);
        }

        reportData.floors = floorsData;
        reportData.statistics = {
          totalFloors: floorsData.length,
          totalDoors,
          completedDoors,
          pendingDoors: totalDoors - completedDoors,
          totalPhotos
        };
      } else {
        // Project level report
        const systemStats = {};
        for (const system of SYSTEM_TYPES) {
          const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${system}/floors`);
          const floorsSnapshot = await getDocs(floorsRef);
          const floorsCount = floorsSnapshot.docs.length;
          let totalDoors = 0;
          let completedDoors = 0;

          for (const floorDoc of floorsSnapshot.docs) {
            const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${system}/floors/${floorDoc.id}/doors`);
            const doorsSnapshot = await getDocs(doorsRef);
            
            doorsSnapshot.docs.forEach(doorDoc => {
              const doorData = doorDoc.data();
              totalDoors++;
              if (doorData.checkpoints.every(cp => cp.completed)) {
                completedDoors++;
              }
            });
          }

          systemStats[system] = {
            floors: floorsCount,
            totalDoors,
            completedDoors,
            pendingDoors: totalDoors - completedDoors,
            completionPercentage: totalDoors ? Math.round((completedDoors / totalDoors) * 100) : 0
          };
        }

        reportData.systemStats = systemStats;
      }

      setReportData(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportData) return;

    try {
      setLoading(true);
      const pdf = new jsPDF();
      
      // Add header
      pdf.setFontSize(20);
      pdf.text('Installation Report', pdf.internal.pageSize.width / 2, 15, { align: 'center' });
      
      // Add project info
      pdf.setFontSize(12);
      pdf.text(`Project: ${reportData.projectName}`, 20, 30);
      pdf.text(`Client: ${reportData.client}`, 20, 37);
      pdf.text(`Generated: ${format(new Date(reportData.generatedAt), 'PPpp')}`, 20, 44);

      let yPosition = 60;

      if (selectedSystem) {
        // System specific report
        pdf.setFontSize(16);
        pdf.text(`System: ${selectedSystem}`, 20, yPosition);
        yPosition += 10;

        // Add statistics
        pdf.setFontSize(14);
        pdf.text('Summary', 20, yPosition);
        yPosition += 10;

        const statsData = [
          ['Total Floors', reportData.statistics.totalFloors],
          ['Total Doors', reportData.statistics.totalDoors],
          ['Completed Doors', reportData.statistics.completedDoors],
          ['Pending Doors', reportData.statistics.pendingDoors],
          ['Total Photos', reportData.statistics.totalPhotos]
        ];

        pdf.autoTable({
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: statsData,
          margin: { left: 20 },
          theme: 'grid'
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Add floors and doors details
        for (const floor of reportData.floors) {
          if (yPosition > pdf.internal.pageSize.height - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(14);
          pdf.text(`Floor: ${floor.name}`, 20, yPosition);
          yPosition += 10;

          const doorData = floor.doors.map(door => [
            `Door ${door.number}`,
            `${door.completedCheckpoints}/${door.totalCheckpoints}`,
            `${Math.round((door.completedCheckpoints / door.totalCheckpoints) * 100)}%`
          ]);

          if (doorData.length > 0) {
            pdf.autoTable({
              startY: yPosition,
              head: [['Door', 'Completed', 'Progress']],
              body: doorData,
              margin: { left: 20 },
              theme: 'grid'
            });
            yPosition = pdf.lastAutoTable.finalY + 15;
          }
        }
      } else {
        // Project level report
        pdf.setFontSize(14);
        pdf.text('Systems Overview', 20, yPosition);
        yPosition += 10;

        const systemsData = Object.entries(reportData.systemStats).map(([system, stats]) => [
          system,
          stats.floors,
          stats.totalDoors,
          stats.completedDoors,
          `${stats.completionPercentage}%`
        ]);

        pdf.autoTable({
          startY: yPosition,
          head: [['System', 'Floors', 'Total Doors', 'Completed', 'Progress']],
          body: systemsData,
          margin: { left: 20 },
          theme: 'grid'
        });
      }

      pdf.save(`${reportData.projectName}-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project *
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System (Optional)
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Systems</option>
              {SYSTEM_TYPES.map(system => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>

          {selectedSystem && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor (Optional)
              </label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Floors</option>
                {floors.map(floor => (
                  <option key={floor.id} value={floor.id}>
                    {floor.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedFloor && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Door (Optional)
              </label>
              <select
                value={selectedDoor}
                onChange={(e) => setSelectedDoor(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">All Doors</option>
                {doors.map(door => (
                  <option key={door.id} value={door.id}>
                    Door {door.number}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={generateReport}
            disabled={!selectedProject || loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaFilter className="text-sm" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Generating report...</p>
        </div>
      )}

      {/* Report Content */}
      {reportData && !loading && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{reportData.projectName}</h2>
              <p className="text-sm text-gray-500">Client: {reportData.client}</p>
              {selectedSystem && (
                <p className="text-sm text-gray-500">System: {selectedSystem}</p>
              )}
              <p className="text-sm text-gray-500">
                Generated: {format(new Date(reportData.generatedAt), 'PPpp')}
              </p>
            </div>
            <button
              onClick={downloadPDF}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <FaDownload className="text-sm" />
              Download PDF
            </button>
          </div>

          {selectedSystem ? (
            <>
              {/* System Level Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Floors</p>
                    <p className="text-2xl font-bold text-blue-600">{reportData.statistics.totalFloors}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Doors</p>
                    <p className="text-2xl font-bold text-purple-600">{reportData.statistics.totalDoors}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{reportData.statistics.completedDoors}</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{reportData.statistics.pendingDoors}</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Photos</p>
                    <p className="text-2xl font-bold text-indigo-600">{reportData.statistics.totalPhotos}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Report */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Detailed Report</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {reportData.floors.map((floor) => (
                    <div key={floor.id} className="p-4">
                      <h4 className="font-medium text-gray-800 mb-2">{floor.name}</h4>
                      <div className="ml-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {floor.doors.map((door) => (
                            <div
                              key={door.id}
                              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-700">Door {door.number}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  door.completedCheckpoints === door.totalCheckpoints
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {door.completedCheckpoints}/{door.totalCheckpoints}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {door.checkpoints.map((checkpoint, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 ${
                                      checkpoint.completed ? 'bg-green-500' : 'bg-gray-300'
                                    }`} />
                                    <p className="text-sm text-gray-600">{checkpoint.name}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Project Level Overview */
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Systems Overview</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(reportData.systemStats).map(([system, stats]) => (
                    <div key={system} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3">{system}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Floors:</span>
                          <span className="font-medium">{stats.floors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Doors:</span>
                          <span className="font-medium">{stats.totalDoors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Completed:</span>
                          <span className="font-medium text-green-600">{stats.completedDoors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Pending:</span>
                          <span className="font-medium text-yellow-600">{stats.pendingDoors}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Progress:</span>
                          <span className="font-medium text-blue-600">{stats.completionPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500">Select filters and generate a report</p>
        </div>
      )}
    </div>
  );
}

export default Reports;