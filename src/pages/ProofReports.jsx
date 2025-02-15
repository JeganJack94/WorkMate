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

function ProofReports() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [floors, setFloors] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject && selectedSystem) {
      fetchFloors();
    } else {
      setFloors([]);
      setSelectedFloor('');
    }
  }, [selectedProject, selectedSystem]);

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

  const generateReport = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const project = projects.find(p => p.id === selectedProject);
      let reportData = {
        projectName: project.name,
        client: project.client,
        generatedAt: new Date().toISOString(),
        floors: []
      };

      // Fetch floors and doors data
      const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors`);
      const floorsSnapshot = await getDocs(floorsRef);
      
      for (const floorDoc of floorsSnapshot.docs) {
        if (selectedFloor && floorDoc.id !== selectedFloor) continue;

        const floor = {
          id: floorDoc.id,
          ...floorDoc.data(),
          doors: []
        };

        const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floor.id}/doors`);
        const doorsSnapshot = await getDocs(doorsRef);
        
        floor.doors = doorsSnapshot.docs.map(doorDoc => ({
          id: doorDoc.id,
          ...doorDoc.data(),
          completedCheckpoints: doorDoc.data().checkpoints.filter(cp => cp.completed).length,
          totalCheckpoints: doorDoc.data().checkpoints.length
        }));

        reportData.floors.push(floor);
      }

      // Calculate statistics
      const allDoors = reportData.floors.flatMap(floor => floor.doors);
      reportData.statistics = {
        totalFloors: reportData.floors.length,
        totalDoors: allDoors.length,
        completedDoors: allDoors.filter(door => 
          door.completedCheckpoints === door.totalCheckpoints
        ).length,
        totalPhotos: allDoors.reduce((acc, door) => 
          acc + door.checkpoints.filter(cp => cp.photo).length, 0
        )
      };

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
      pdf.text('Installation Proof Report', pdf.internal.pageSize.width / 2, 15, { align: 'center' });
      
      // Add project info
      pdf.setFontSize(12);
      pdf.text(`Project: ${reportData.projectName}`, 20, 30);
      pdf.text(`Client: ${reportData.client}`, 20, 37);
      pdf.text(`System: ${selectedSystem}`, 20, 44);
      pdf.text(`Generated: ${format(new Date(reportData.generatedAt), 'PPpp')}`, 20, 51);

      let yPosition = 70;

      // Add statistics
      pdf.setFontSize(14);
      pdf.text('Summary', 20, yPosition);
      yPosition += 10;

      const statsData = [
        ['Total Floors', reportData.statistics.totalFloors],
        ['Total Doors', reportData.statistics.totalDoors],
        ['Completed Doors', reportData.statistics.completedDoors],
        ['Total Photos', reportData.statistics.totalPhotos]
      ];

      pdf.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: statsData,
        margin: { left: 20 },
        theme: 'grid'
      });

      yPosition = pdf.lastAutoTable.finalY + 20;

      // Add floor and door details with photos
      for (const floor of reportData.floors) {
        if (yPosition > pdf.internal.pageSize.height - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        // Floor Header
        pdf.setFontSize(16);
        pdf.text(`Floor: ${floor.name}`, 20, yPosition);
        yPosition += 15;

        // Process each door
        for (const door of floor.doors) {
          if (yPosition > pdf.internal.pageSize.height - 30) {
            pdf.addPage();
            yPosition = 20;
          }

          // Door Header
          pdf.setFontSize(14);
          pdf.text(`Door: ${door.number}`, 20, yPosition);
          yPosition += 10;

          // Add checkpoints table
          const checkpointData = door.checkpoints.map(cp => [
            cp.name,
            cp.completed ? 'Completed' : 'Pending',
            cp.completedAt ? format(new Date(cp.completedAt), 'PPp') : '-',
            cp.photo ? 'Yes' : 'No'
          ]);

          pdf.autoTable({
            startY: yPosition,
            head: [['Checkpoint', 'Status', 'Completed At', 'Photo']],
            body: checkpointData,
            margin: { left: 20 },
            theme: 'grid'
          });

          yPosition = pdf.lastAutoTable.finalY + 15;

          // Add photos for completed checkpoints with photos
          for (const checkpoint of door.checkpoints) {
            if (checkpoint.photo) {
              if (yPosition > pdf.internal.pageSize.height - 90) {
                pdf.addPage();
                yPosition = 20;
              }

              try {
                // Add checkpoint name
                pdf.setFontSize(12);
                pdf.text(`${checkpoint.name} - Photo`, 20, yPosition);
                yPosition += 10;

                // Add photo
                const imgData = checkpoint.photo.url;
                pdf.addImage(imgData, 'JPEG', 20, yPosition, 170, 80);
                yPosition += 90;
              } catch (error) {
                console.error('Error adding photo to PDF:', error);
                pdf.text('Error loading photo', 20, yPosition);
                yPosition += 10;
              }
            }
          }

          yPosition += 10;
        }

        yPosition += 10;
      }

      pdf.save(`${reportData.projectName}-proof-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Installation Proof Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              System *
            </label>
            <select
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Select System</option>
              {SYSTEM_TYPES.map(system => (
                <option key={system} value={system}>
                  {system}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor (Optional)
            </label>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={!selectedSystem}
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={!selectedProject || !selectedSystem || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFilter className="text-sm" />
              Generate Report
            </button>
          </div>
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
              <p className="text-sm text-gray-500">System: {selectedSystem}</p>
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

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <p className="text-sm text-gray-600">Total Photos</p>
                <p className="text-2xl font-bold text-yellow-600">{reportData.statistics.totalPhotos}</p>
              </div>
            </div>
          </div>

          {/* Floor Details */}
          {reportData.floors.map((floor) => (
            <div key={floor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">{floor.name}</h3>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Door</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photos</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {floor.doors.map((door) => (
                        <tr key={door.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">Door {door.number}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{door.completedCheckpoints}/{door.totalCheckpoints}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{door.checkpoints.filter(cp => cp.photo).length}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${Math.round((door.completedCheckpoints / door.totalCheckpoints) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                {Math.round((door.completedCheckpoints / door.totalCheckpoints) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
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

export default ProofReports; 