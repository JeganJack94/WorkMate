import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartBar, FaClipboardCheck, FaBoxes, FaMobileAlt, FaCloud, FaShieldAlt } from 'react-icons/fa';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Streamline Your</span>
                  <span className="block text-blue-600">Installation Projects</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
                  Track installations, manage inventory, and generate reports with our comprehensive project management solution.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <Link
                      to="/signup"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-all duration-300 hover:scale-105"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-all duration-300 hover:scale-105"
                    >
                      Sign In
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/learn-more"
                      className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all duration-300 hover:scale-105"
                    >
                      Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white bg-opacity-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything You Need
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comprehensive tools for managing your installation projects
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FaChartBar className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
                  <p className="text-gray-600">Track project progress and performance with interactive dashboards and reports.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                  <FaClipboardCheck className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Installation Tracking</h3>
                  <p className="text-gray-600">Manage and monitor installation progress with detailed checklists and photo proof.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                  <FaBoxes className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventory Management</h3>
                  <p className="text-gray-600">Keep track of your stock levels, supplies, and installations in one place.</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-yellow-500 to-orange-600 flex items-center justify-center">
                  <FaMobileAlt className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                  <p className="text-gray-600">Access your projects on the go with our responsive mobile interface.</p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                  <FaCloud className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cloud Storage</h3>
                  <p className="text-gray-600">Securely store and access your project data and photos in the cloud.</p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="group relative bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="h-48 bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
                  <FaShieldAlt className="h-20 w-20 text-white opacity-75 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Access</h3>
                  <p className="text-gray-600">Role-based access control and data encryption for maximum security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Join thousands of professionals managing their installation projects efficiently.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 md:py-4 md:text-lg md:px-10 transition-all duration-300 hover:scale-105"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            © {new Date().getFullYear()} WinTech. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;