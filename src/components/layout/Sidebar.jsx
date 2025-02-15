import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaTasks, 
  FaBoxes,
  FaChartBar,
  FaCheckSquare,
  FaCog,
  FaBars,
  FaAngleLeft,
  FaAngleRight
} from 'react-icons/fa';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    setIsMobileOpen(false);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [location.pathname]);

  const menuItems = [
    { 
      icon: FaHome, 
      label: 'Dashboard', 
      path: '/dashboard',
      isActive: (path) => path === '/dashboard' || path === '/'
    },
    { 
      icon: FaTasks, 
      label: 'Projects', 
      path: '/projects',
      isActive: (path) => path.startsWith('/projects')
    },
    { 
      icon: FaBoxes, 
      label: 'Stocks', 
      path: '/stocks',
      isActive: (path) => path.startsWith('/stocks')
    },
    { 
      icon: FaCheckSquare, 
      label: 'Checklist', 
      path: '/checklist',
      isActive: (path) => path.startsWith('/checklist')
    },
    { 
      icon: FaChartBar, 
      label: 'Reports', 
      path: '/reports',
      isActive: (path) => path.startsWith('/reports')
    },
    { 
      icon: FaCog, 
      label: 'Settings', 
      path: '/settings',
      isActive: (path) => path.startsWith('/settings')
    },
  ];

  const isItemActive = (item) => {
    if (item.isActive) {
      return item.isActive(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-20 md:hidden bg-gray-900 text-white p-2 
          rounded-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle navigation menu"
      >
        <FaBars size={20} />
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white 
          transition-all duration-300 ease-in-out z-40
          ${isCollapsed ? 'w-16' : 'w-64'} 
          md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl`}
      >
        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-10 text-white p-1 rounded-full shadow-lg 
            cursor-pointer transition-all duration-300 hidden md:flex items-center justify-center
            ${isCollapsed ? 'hover:translate-x-1' : 'hover:-translate-x-1'}
            bg-gray-900 hover:bg-gray-800`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FaAngleRight size={20} /> : <FaAngleLeft size={20} />}
        </button>

        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-8`}>
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                  bg-clip-text text-transparent">
                  WorkApp
                </span>
              )}
              <button
                className="text-white p-2 rounded-lg hover:bg-gray-700 
                  transition-colors md:hidden"
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <FaAngleLeft />
              </button>
            </div>

            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`flex items-center p-2 rounded-lg transition-all duration-200
                        ${isItemActive(item)
                          ? 'bg-blue-600 text-white' 
                          : 'hover:bg-gray-800'}
                        ${isCollapsed ? 'justify-center' : 'space-x-3'}
                        group`}
                    >
                      <item.icon className={`
                        ${isCollapsed ? 'text-xl' : ''}
                        ${isItemActive(item)
                          ? 'text-white' 
                          : 'text-gray-300 group-hover:text-white'}
                      `} />
                      {!isCollapsed && (
                        <span className={`transition-colors duration-200
                          ${isItemActive(item)
                            ? 'text-white' 
                            : 'text-gray-300 group-hover:text-white'}
                        `}>
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;