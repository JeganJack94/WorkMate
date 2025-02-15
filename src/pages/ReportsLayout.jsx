import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

function ReportsLayout() {
  const location = useLocation();

  const tabs = [
    { name: 'Overall Summary', path: '/reports', shortName: 'Summary' },
    { name: 'Installation Proof', path: '/reports/proof', shortName: 'Proof' },
    { name: 'Stock Reports', path: '/reports/stock', shortName: 'Stock' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-600 hidden sm:block">
            Generate and download various reports for your projects
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
          <div className="flex min-w-full">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.path}
                className={`
                  flex-1 sm:flex-none text-center whitespace-nowrap py-2 sm:py-4 px-2 sm:px-6 border-b-2 font-medium text-sm
                  ${location.pathname === tab.path
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                  transition-colors duration-200
                `}
              >
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.shortName}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-2 sm:px-6 py-4 sm:py-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsLayout; 