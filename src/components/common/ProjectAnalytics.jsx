import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ProjectAnalytics = ({ projectData }) => {
  const stocksChartData = {
    labels: Object.keys(projectData.systems).map(key => projectData.systems[key].name),
    datasets: [
      {
        label: 'Total Items',
        data: Object.values(projectData.systems).map(system => system.stocks.total),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Fully Supplied',
        data: Object.values(projectData.systems).map(system => system.stocks.fullySupplied),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      }
    ]
  };

  const checklistChartData = {
    labels: Object.keys(projectData.systems).map(key => projectData.systems[key].name),
    datasets: [
      {
        label: 'Total Tasks',
        data: Object.values(projectData.systems).map(system => system.checklist.total),
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      },
      {
        label: 'Completed',
        data: Object.values(projectData.systems).map(system => system.checklist.completed),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      }
    ]
  };

  const overallProgressData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [
          Object.values(projectData.systems).reduce((acc, system) => acc + system.checklist.completed, 0),
          Object.values(projectData.systems).reduce((acc, system) => 
            acc + (system.checklist.total - system.checklist.completed), 0
          )
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(234, 179, 8, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(234, 179, 8, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200/80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Status by System</h3>
          <Bar
            data={stocksChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }}
          />
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200/80">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Checklist Progress by System</h3>
          <Bar
            data={checklistChartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200/80">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Completion Status</h3>
        <div className="w-full max-w-xs mx-auto">
          <Doughnut
            data={overallProgressData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                }
              },
              cutout: '70%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;