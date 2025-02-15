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

function StockReports() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

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
        systemStats: {},
        statistics: {
          totalItems: 0,
          totalBoq: 0,
          totalSupplied: 0,
          totalInstalled: 0,
          totalAttic: 0
        }
      };

      // Fetch stocks data
      if (selectedSystem) {
        // System specific stocks
        const stocksRef = collection(db, `users/${user.uid}/projects/${selectedProject}/stocks`);
        const snapshot = await getDocs(stocksRef);
        const stocksData = snapshot.docs
          .filter(doc => doc.data().systemName === selectedSystem)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        reportData.systemName = selectedSystem;
        reportData.stocks = stocksData;
        
        if (stocksData.length > 0) {
          reportData.statistics = {
            totalItems: stocksData.length,
            totalBoq: stocksData.reduce((acc, stock) => acc + (stock.boq || 0), 0),
            totalSupplied: stocksData.reduce((acc, stock) => acc + (stock.suppliedQty || 0), 0),
            totalInstalled: stocksData.reduce((acc, stock) => acc + (stock.installedQty || 0), 0),
            totalAttic: stocksData.reduce((acc, stock) => acc + ((stock.suppliedQty || 0) - (stock.installedQty || 0)), 0)
          };
        }
      } else {
        // All systems stocks
        const stocksRef = collection(db, `users/${user.uid}/projects/${selectedProject}/stocks`);
        const snapshot = await getDocs(stocksRef);
        const allStocks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group stocks by system
        SYSTEM_TYPES.forEach(system => {
          const systemStocks = allStocks.filter(stock => stock.systemName === system);
          reportData.systemStats[system] = {
            totalItems: systemStocks.length,
            totalBoq: systemStocks.reduce((acc, stock) => acc + (stock.boq || 0), 0),
            totalSupplied: systemStocks.reduce((acc, stock) => acc + (stock.suppliedQty || 0), 0),
            totalInstalled: systemStocks.reduce((acc, stock) => acc + (stock.installedQty || 0), 0),
            totalAttic: systemStocks.reduce((acc, stock) => acc + ((stock.suppliedQty || 0) - (stock.installedQty || 0)), 0),
            stocks: systemStocks
          };
        });
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
      pdf.text('Stock Report', pdf.internal.pageSize.width / 2, 15, { align: 'center' });
      
      // Add project info
      pdf.setFontSize(12);
      pdf.text(`Project: ${reportData.projectName}`, 20, 30);
      pdf.text(`Client: ${reportData.client}`, 20, 37);
      pdf.text(`Generated: ${format(new Date(reportData.generatedAt), 'PPpp')}`, 20, 44);

      let yPosition = 60;

      if (selectedSystem) {
        // System specific report
        pdf.setFontSize(16);
        pdf.text(`System: ${reportData.systemName}`, 20, yPosition);
        yPosition += 10;

        // Add statistics
        pdf.setFontSize(14);
        pdf.text('Summary', 20, yPosition);
        yPosition += 10;

        const statsData = [
          ['Total Items', reportData.statistics.totalItems],
          ['Total BOQ', reportData.statistics.totalBoq],
          ['Total Supplied', reportData.statistics.totalSupplied],
          ['Total Installed', reportData.statistics.totalInstalled],
          ['Total ATTIC', reportData.statistics.totalAttic]
        ];

        pdf.autoTable({
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: statsData,
          margin: { left: 20 },
          theme: 'grid'
        });

        yPosition = pdf.lastAutoTable.finalY + 15;

        // Add stock details
        pdf.setFontSize(14);
        pdf.text('Stock Details', 20, yPosition);
        yPosition += 10;

        const stocksData = reportData.stocks.map(stock => [
          stock.systemName,
          stock.boq,
          stock.suppliedQty,
          stock.installedQty,
          stock.suppliedQty - stock.installedQty
        ]);

        pdf.autoTable({
          startY: yPosition,
          head: [['System', 'BOQ', 'Supplied', 'Installed', 'ATTIC']],
          body: stocksData,
          margin: { left: 20 },
          theme: 'grid'
        });
      } else {
        // Project level report
        Object.entries(reportData.systemStats).forEach(([system, stats]) => {
          if (yPosition > pdf.internal.pageSize.height - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(14);
          pdf.text(`${system} Summary`, 20, yPosition);
          yPosition += 10;

          const statsData = [
            ['Total Items', stats.totalItems],
            ['Total BOQ', stats.totalBoq],
            ['Total Supplied', stats.totalSupplied],
            ['Total Installed', stats.totalInstalled],
            ['Total ATTIC', stats.totalAttic]
          ];

          pdf.autoTable({
            startY: yPosition,
            head: [['Metric', 'Value']],
            body: statsData,
            margin: { left: 20 },
            theme: 'grid'
          });

          yPosition = pdf.lastAutoTable.finalY + 15;

          if (stats.stocks.length > 0) {
            const stocksData = stats.stocks.map(stock => [
              stock.systemName,
              stock.boq,
              stock.suppliedQty,
              stock.installedQty,
              stock.suppliedQty - stock.installedQty
            ]);

            pdf.autoTable({
              startY: yPosition,
              head: [['System', 'BOQ', 'Supplied', 'Installed', 'ATTIC']],
              body: stocksData,
              margin: { left: 20 },
              theme: 'grid'
            });

            yPosition = pdf.lastAutoTable.finalY + 20;
          }
        });
      }

      pdf.save(`${reportData.projectName}-stock-report.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Reports</h1>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={!selectedProject || loading}
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
              {selectedSystem && (
                <p className="text-sm text-gray-500">System: {reportData.systemName}</p>
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
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.statistics?.totalItems || 0}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total BOQ</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {reportData.statistics?.totalBoq || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Supplied</p>
                    <p className="text-2xl font-bold text-green-600">
                      {reportData.statistics?.totalSupplied || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Installed</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {reportData.statistics?.totalInstalled || 0}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">ATTIC</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {reportData.statistics?.totalAttic || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Details */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Stock Details</h3>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOQ</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplied</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installed</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATTIC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.stocks?.map((stock) => (
                          <tr key={stock.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">{stock.systemName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{stock.boq || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{stock.suppliedQty || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{stock.installedQty || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{(stock.suppliedQty || 0) - (stock.installedQty || 0)}</td>
                          </tr>
                        ))}
                        {(!reportData.stocks || reportData.stocks.length === 0) && (
                          <tr>
                            <td colSpan="5" className="px-4 py-3 text-sm text-gray-500 text-center">
                              No stocks found for this system
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Project Level Overview */
            <div className="space-y-6">
              {reportData.systemStats && Object.entries(reportData.systemStats).map(([system, stats]) => (
                stats && (
                  <div key={system} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800">{system}</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Total Items</p>
                          <p className="text-xl font-bold text-blue-600">{stats.totalItems || 0}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Total BOQ</p>
                          <p className="text-xl font-bold text-purple-600">{stats.totalBoq || 0}</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Supplied</p>
                          <p className="text-xl font-bold text-green-600">{stats.totalSupplied || 0}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">Installed</p>
                          <p className="text-xl font-bold text-yellow-600">{stats.totalInstalled || 0}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600">ATTIC</p>
                          <p className="text-xl font-bold text-indigo-600">{stats.totalAttic || 0}</p>
                        </div>
                      </div>

                      {stats.stocks && stats.stocks.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOQ</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplied</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installed</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ATTIC</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {stats.stocks.map((stock) => (
                                <tr key={stock.id}>
                                  <td className="px-4 py-3 text-sm text-gray-900">{stock.systemName}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{stock.boq || 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{stock.suppliedQty || 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{stock.installedQty || 0}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{(stock.suppliedQty || 0) - (stock.installedQty || 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )
              ))}
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

export default StockReports; 