import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBox, FaClipboardCheck, FaProjectDiagram, FaChartBar } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const SYSTEM_TYPES = [
  'Access Control',
  'CCTV',
  'Fire Alarm',
  'PAS'
];

function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    projectStats: {},
    stockStats: {},
    taskStats: {}
  });

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject) {
      fetchDashboardData();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const projectsRef = collection(db, `users/${user.uid}/projects`);
      const snapshot = await getDocs(projectsRef);
      const projectsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch stocks data
      const stocksRef = collection(db, `users/${user.uid}/projects/${selectedProject}/stocks`);
      const stocksSnapshot = await getDocs(stocksRef);
      const stocksData = stocksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Process stocks data by system
      const stockStats = {};
      SYSTEM_TYPES.forEach(system => {
        const systemStocks = stocksData.filter(stock => stock.systemName === system);
        stockStats[system] = {
          total: systemStocks.length,
          supplied: systemStocks.reduce((acc, stock) => acc + (stock.suppliedQty || 0), 0),
          installed: systemStocks.reduce((acc, stock) => acc + (stock.installedQty || 0), 0),
          pending: systemStocks.reduce((acc, stock) => {
            const supplied = stock.suppliedQty || 0;
            const installed = stock.installedQty || 0;
            return acc + (supplied - installed);
          }, 0)
        };
      });

      // Fetch checklist data
      const checklistData = {};
      for (const system of SYSTEM_TYPES) {
        const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${system}/floors`);
        const floorsSnapshot = await getDocs(floorsRef);
        
        let totalTasks = 0;
        let completedTasks = 0;
        let totalPhotos = 0;

        for (const floorDoc of floorsSnapshot.docs) {
          const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${system}/floors/${floorDoc.id}/doors`);
          const doorsSnapshot = await getDocs(doorsRef);
          
          doorsSnapshot.docs.forEach(doorDoc => {
            const checkpoints = doorDoc.data().checkpoints || [];
            totalTasks += checkpoints.length;
            completedTasks += checkpoints.filter(cp => cp.completed).length;
            totalPhotos += checkpoints.filter(cp => cp.photo).length;
          });
        }

        checklistData[system] = {
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks,
          totalPhotos
        };
      }

      setDashboardData({
        stockStats,
        taskStats: checklistData
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const stocksChartData = {
    labels: SYSTEM_TYPES,
    datasets: [
      {
        label: 'Supplied',
        data: SYSTEM_TYPES.map(system => dashboardData.stockStats[system]?.supplied || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Installed',
        data: SYSTEM_TYPES.map(system => dashboardData.stockStats[system]?.installed || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      }
    ]
  };

  const tasksChartData = {
    labels: SYSTEM_TYPES,
    datasets: [
      {
        label: 'Completed Tasks',
        data: SYSTEM_TYPES.map(system => dashboardData.taskStats[system]?.completedTasks || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
      },
      {
        label: 'Pending Tasks',
        data: SYSTEM_TYPES.map(system => dashboardData.taskStats[system]?.pendingTasks || 0),
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      }
    ]
  };

  const projectProgressData = {
    labels: SYSTEM_TYPES,
    datasets: [
      {
        label: 'Installation Progress',
        data: SYSTEM_TYPES.map(system => {
          const stats = dashboardData.taskStats[system];
          if (!stats || stats.totalTasks === 0) return 0;
          return (stats.completedTasks / stats.totalTasks) * 100;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3
      }
    ]
  };

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SYSTEM_TYPES.map(system => {
                const stockStats = dashboardData.stockStats[system] || {};
                const taskStats = dashboardData.taskStats[system] || {};
                const progress = taskStats.totalTasks 
                  ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) 
                  : 0;

                return (
                  <div key={system} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{system}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Stocks:</span>
                        <span className="font-medium">{stockStats.total || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tasks:</span>
                        <span className="font-medium">{taskStats.completedTasks || 0}/{taskStats.totalTasks || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stocks Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Overview</h3>
                <Bar
                  data={stocksChartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>

              {/* Tasks Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Task Overview</h3>
                <Bar
                  data={tasksChartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>

              {/* Progress Line Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Installation Progress</h3>
                <Line
                  data={projectProgressData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: value => `${value}%`
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  to={`/stocks`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <FaBox /> Manage Stocks
                </Link>
                <Link
                  to={`/checklist`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <FaClipboardCheck /> View Checklist
                </Link>
                <Link
                  to={`/reports`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <FaChartBar /> Generate Reports
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;