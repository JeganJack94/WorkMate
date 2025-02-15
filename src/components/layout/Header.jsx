import React from 'react';
import { FaBars, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useParams, Link } from 'react-router-dom';

const Header = ({ onToggleSidebar, onLogout }) => {
  const { user } = useAuth();
  const location = useLocation();
  const { projectId } = useParams();

  const getBreadcrumbs = () => {
    const path = location.pathname;

    if (path === '/') {
      return { title: 'Dashboard', showBack: false };
    }

    if (path === '/projects') {
      return { title: 'Projects', showBack: false };
    }

    if (path.includes('/projects/') && path.includes('/stocks')) {
      return {
        title: 'Project Stocks',
        showBack: true,
        backPath: '/projects'
      };
    }

    if (path.includes('/projects/') && path.includes('/checklist')) {
      return {
        title: 'Project Checklist',
        showBack: true,
        backPath: '/projects'
      };
    }

    if (path === '/reports') {
      return { title: 'Reports', showBack: false };
    }

    if (path === '/settings') {
      return { title: 'Settings', showBack: false };
    }

    return { title: '', showBack: false };
  };

  const breadcrumb = getBreadcrumbs();

  return (
    <header className="bg-gray-300 shadow-sm h-14 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">

      </div>

      {/* User profile with hover dropdown */}
      {user && (
        <div className="relative group">
          <div className="flex items-center gap-3 cursor-pointer py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <FaUserCircle className="text-white text-lg" />
            </div>
            <span className="text-gray-700 font-medium hidden sm:inline-block">
              {user.email?.split('@')[0]}
            </span>
          </div>

          {/* Hover dropdown */}
          <div className="absolute right-0 top-[100%] w-40 bg-white rounded-lg shadow-lg py-0.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform translate-y-1 group-hover:translate-y-0 z-50">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;