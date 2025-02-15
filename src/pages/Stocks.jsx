import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const SYSTEM_TYPES = [
  'Access Control',
  'CCTV',
  'Fire Alarm',
  'PAS'
];

function Stocks() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [formData, setFormData] = useState({
    systemName: '',
    boq: 0,
    suppliedQty: 0,
    installedQty: 0
  });

  // Fetch projects when component mounts
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Fetch stocks when project is selected
  useEffect(() => {
    if (selectedProject) {
      fetchStocks();
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, `users/${user.uid}/projects`);
      const querySnapshot = await getDocs(projectsRef);
      
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      const stocksRef = collection(db, `users/${user.uid}/projects/${selectedProject}/stocks`);
      const querySnapshot = await getDocs(stocksRef);
      
      const stocksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStocks(stocksData);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      const stockData = {
        ...formData,
        atticStock: formData.suppliedQty - formData.installedQty,
        createdAt: new Date().toISOString()
      };

      if (currentStock) {
        const stockRef = doc(db, `users/${user.uid}/projects/${selectedProject}/stocks`, currentStock.id);
        await updateDoc(stockRef, stockData);
      } else {
        await addDoc(collection(db, `users/${user.uid}/projects/${selectedProject}/stocks`), stockData);
      }
      
      setIsModalOpen(false);
      setCurrentStock(null);
      resetForm();
      fetchStocks();
    } catch (error) {
      console.error('Error saving stock:', error);
    }
  };

  const handleEdit = (stock) => {
    setCurrentStock(stock);
    setFormData({
      systemName: stock.systemName,
      boq: stock.boq,
      suppliedQty: stock.suppliedQty,
      installedQty: stock.installedQty
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (stockId) => {
    if (!selectedProject) return;
    
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        const stockRef = doc(db, `users/${user.uid}/projects/${selectedProject}/stocks`, stockId);
        await deleteDoc(stockRef);
        fetchStocks();
      } catch (error) {
        console.error('Error deleting stock:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      systemName: '',
      boq: 0,
      suppliedQty: 0,
      installedQty: 0
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-800">Stock Management</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!selectedProject}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus size={16} />
            <span className="hidden sm:inline">Add Stock</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Stocks Grid */}
      {selectedProject && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="px-3 py-2 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {stock.systemName}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(stock)}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded-full"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(stock.id)}
                      className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* BOQ */}
                  <div className="bg-gray-50 px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">
                    <p className="text-xs text-gray-500">BOQ</p>
                    <p className="text-sm font-semibold text-gray-800">{stock.boq}</p>
                  </div>

                  {/* ATTIC Stock */}
                  <div className={`px-2 py-1.5 rounded-md transition-colors ${
                    stock.atticStock > 0 
                      ? 'bg-green-50 hover:bg-green-100' 
                      : stock.atticStock < 0 
                        ? 'bg-red-50 hover:bg-red-100'
                        : 'bg-yellow-50 hover:bg-yellow-100'
                  }`}>
                    <p className="text-xs text-gray-500">ATTIC Stock</p>
                    <p className={`text-sm font-semibold ${
                      stock.atticStock > 0 
                        ? 'text-green-600' 
                        : stock.atticStock < 0 
                          ? 'text-red-600'
                          : 'text-yellow-600'
                    }`}>
                      {stock.atticStock}
                    </p>
                  </div>
                </div>

                {/* Quantities */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Supplied Quantity */}
                  <div className="bg-blue-50 px-2 py-1.5 rounded-md hover:bg-blue-100 transition-colors">
                    <p className="text-xs text-gray-500">Supplied</p>
                    <p className="text-sm font-semibold text-blue-600">{stock.suppliedQty}</p>
                  </div>

                  {/* Installed Quantity */}
                  <div className="bg-purple-50 px-2 py-1.5 rounded-md hover:bg-purple-100 transition-colors">
                    <p className="text-xs text-gray-500">Installed</p>
                    <p className="text-sm font-semibold text-purple-600">{stock.installedQty}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedProject && !loading && stocks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">No stocks added yet</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={16} />
            Add Your First Stock
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {currentStock ? 'Edit Stock' : 'New Stock'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <select
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select System</option>
                    {SYSTEM_TYPES.map((system) => (
                      <option key={system} value={system}>
                        {system}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOQ
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.boq}
                    onChange={(e) => setFormData({ ...formData, boq: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplied Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.suppliedQty}
                    onChange={(e) => setFormData({ ...formData, suppliedQty: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Installed Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.installedQty}
                    onChange={(e) => setFormData({ ...formData, installedQty: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {currentStock ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stocks; 