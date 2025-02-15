import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaBoxes, FaCheckSquare } from 'react-icons/fa';

function ProjectDetails() {
  const { projectId } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Project Details</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Project Actions */}
        <Link
          to={`/stocks/project/${projectId}`}
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
            border border-gray-100 flex items-center gap-4 group"
        >
          <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
            <FaBoxes className="text-2xl text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Manage Stocks</h3>
            <p className="text-sm text-gray-600">View and manage project stocks</p>
          </div>
        </Link>

        <Link
          to={`/checklist/project/${projectId}`}
          className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow
            border border-gray-100 flex items-center gap-4 group"
        >
          <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
            <FaCheckSquare className="text-2xl text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Project Checklist</h3>
            <p className="text-sm text-gray-600">View and manage project tasks</p>
          </div>
        </Link>
      </div>

      {/* Project Info Section */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Information</h2>
        {/* Add project details here */}
      </div>
    </div>
  );
}

export default ProjectDetails; 