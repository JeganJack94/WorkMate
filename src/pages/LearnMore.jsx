import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaProjectDiagram, 
  FaBoxes, 
  FaClipboardCheck, 
  FaChartBar, 
  FaCamera, 
  FaFileAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSearch,
  FaFilter,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';

function LearnMore() {
  const [activeGuide, setActiveGuide] = useState('projects');
  const navigate = useNavigate();

  const guides = {
    projects: {
      title: 'Project Management',
      icon: FaProjectDiagram,
      color: 'blue',
      steps: [
        { title: 'Create Project', icon: FaPlus, description: 'Start by creating a new project with basic details like name and client.' },
        { title: 'Edit Details', icon: FaEdit, description: 'Update project information and status as needed.' },
        { title: 'Track Progress', icon: FaChartBar, description: 'Monitor project completion and milestones in real-time.' }
      ]
    },
    stocks: {
      title: 'Stock Management',
      icon: FaBoxes,
      color: 'green',
      steps: [
        { title: 'Add Stock Items', icon: FaPlus, description: 'Record new stock items with quantities and details.' },
        { title: 'Update Inventory', icon: FaEdit, description: 'Manage stock levels and track supplied vs installed items.' },
        { title: 'Generate Reports', icon: FaFileAlt, description: 'Create detailed stock reports for analysis.' }
      ]
    },
    checklist: {
      title: 'Installation Checklist',
      icon: FaClipboardCheck,
      color: 'purple',
      steps: [
        { title: 'Create Checklist', icon: FaPlus, description: 'Set up installation checklists for each system.' },
        { title: 'Photo Evidence', icon: FaCamera, description: 'Capture and attach photos for installation proof.' },
        { title: 'Track Completion', icon: FaChartBar, description: 'Monitor installation progress in real-time.' }
      ]
    },
    reports: {
      title: 'Reports & Analytics',
      icon: FaChartBar,
      color: 'orange',
      steps: [
        { title: 'Filter Data', icon: FaFilter, description: 'Select specific data points for your report.' },
        { title: 'Generate Report', icon: FaFileAlt, description: 'Create comprehensive reports with charts and tables.' },
        { title: 'Export & Share', icon: FaDownload, description: 'Download reports in PDF format for sharing.' }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
              <FaArrowLeft className="text-lg" />
              <span>Back to Home</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            User Guide & Documentation
          </h1>
          <p className="mt-2 text-gray-600">
            Learn how to use WorkMate effectively for your installation projects
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Guide Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(guides).map(([key, guide]) => (
            <button
              key={key}
              onClick={() => setActiveGuide(key)}
              className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 
                ${activeGuide === key 
                  ? `bg-${guide.color}-600 text-white shadow-lg scale-105` 
                  : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 shadow-md hover:shadow-lg'
                } transform hover:-translate-y-1`}
            >
              <div className="flex items-center gap-3">
                <guide.icon className={`text-2xl transition-transform duration-300 group-hover:scale-110
                  ${activeGuide === key ? 'text-white' : `text-${guide.color}-500`}`} 
                />
                <span className="font-medium">{guide.title}</span>
              </div>
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10 transition-transform duration-700 group-hover:scale-150">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 animate-wave" />
              </div>
            </button>
          ))}
        </div>

        {/* Active Guide Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            {guides[activeGuide].icon && (
              <div className={`text-4xl text-${guides[activeGuide].color}-500 animate-bounce-subtle`}>
                {React.createElement(guides[activeGuide].icon)}
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{guides[activeGuide].title} Guide</h2>
          </div>

          {/* Steps Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {guides[activeGuide].steps.map((step, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-xl p-6 transition-all duration-300 hover:bg-white hover:shadow-lg"
              >
                <div className="absolute top-0 right-0 mt-4 mr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FaArrowRight className={`text-${guides[activeGuide].color}-500`} />
                </div>
                <div className={`w-12 h-12 rounded-full bg-${guides[activeGuide].color}-100 flex items-center justify-center mb-4 
                  group-hover:scale-110 transition-transform duration-300`}>
                  <step.icon className={`text-xl text-${guides[activeGuide].color}-500`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Interactive Demo Button */}
          <div className="mt-8 text-center">
            <Link
              to="/signup"
              className={`inline-flex items-center gap-2 px-6 py-3 bg-${guides[activeGuide].color}-600 text-white rounded-lg
                hover:bg-${guides[activeGuide].color}-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              Try It Now
              <FaArrowRight className="animate-bounce-right" />
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="#" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <FaFileAlt className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2">Documentation</h3>
              <p className="text-blue-100">Detailed guides and API documentation</p>
            </a>
            <a href="#" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <FaSearch className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2">FAQ</h3>
              <p className="text-blue-100">Frequently asked questions and answers</p>
            </a>
            <a href="#" className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <FaEdit className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-semibold mb-2">Contact Support</h3>
              <p className="text-blue-100">Get help from our support team</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnMore; 