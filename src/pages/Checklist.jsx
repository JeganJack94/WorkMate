import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaCheck, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SYSTEM_TYPES = {
  'Access Control': [
    'Door Contact Installation',
    'EM Lock Installation',
    'Card Reader Installation',
    'Exit Switch Installation',
    'Power Supply Connection',
    'Cable Termination',
    'Testing & Commissioning'
  ],
  'CCTV': [
    'Camera Mounting',
    'Cable Routing',
    'Power Connection',
    'Network Configuration',
    'View Angle Adjustment',
    'Recording Test',
    'Motion Detection Setup'
  ],
  'Fire Alarm': [
    'Detector Installation',
    'Manual Call Point Setup',
    'Sounder Installation',
    'Panel Connection',
    'Zone Configuration',
    'Battery Backup Check',
    'Alarm Test'
  ],
  'PAS': [
    'Speaker Mounting',
    'Cable Installation',
    'Amplifier Setup',
    'Zone Assignment',
    'Volume Adjustment',
    'Audio Quality Test',
    'Emergency Broadcast Test'
  ]
};

function Checklist() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSystem, setSelectedSystem] = useState('');
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
  const [isDoorModalOpen, setIsDoorModalOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [newFloorName, setNewFloorName] = useState('');
  const [newDoorNumber, setNewDoorNumber] = useState('');
  const [expandedFloors, setExpandedFloors] = useState({});
  const [expandedDoors, setExpandedDoors] = useState({});
  const [checklistData, setChecklistData] = useState({});

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProject && selectedSystem) {
      fetchFloors();
    }
  }, [selectedProject, selectedSystem]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, `users/${user.uid}/projects`);
      const snapshot = await getDocs(projectsRef);
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const floorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors`);
      const snapshot = await getDocs(floorsRef);
      const floorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFloors(floorsData);
      
      // Fetch doors and checklist data for each floor
      const floorsWithDoors = {};
      for (const floor of floorsData) {
        const doorsRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floor.id}/doors`);
        const doorsSnapshot = await getDocs(doorsRef);
        floorsWithDoors[floor.id] = doorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setChecklistData(floorsWithDoors);
    } catch (error) {
      console.error('Error fetching floors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFloor = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedSystem || !newFloorName.trim()) return;

    try {
      const floorRef = collection(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors`);
      await addDoc(floorRef, {
        name: newFloorName.trim(),
        createdAt: new Date().toISOString()
      });
      setNewFloorName('');
      setIsFloorModalOpen(false);
      fetchFloors();
    } catch (error) {
      console.error('Error adding floor:', error);
    }
  };

  const handleAddDoor = async (e) => {
    e.preventDefault();
    if (!selectedFloor || !newDoorNumber.trim()) return;

    try {
      const doorRef = collection(
        db,
        `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${selectedFloor}/doors`
      );
      await addDoc(doorRef, {
        number: newDoorNumber.trim(),
        createdAt: new Date().toISOString(),
        checkpoints: SYSTEM_TYPES[selectedSystem].map(point => ({
          name: point,
          completed: false,
          photoUrl: null,
          completedAt: null
        }))
      });
      setNewDoorNumber('');
      setIsDoorModalOpen(false);
      fetchFloors();
    } catch (error) {
      console.error('Error adding door:', error);
    }
  };

  const handlePhotoUpload = async (floorId, doorId, checkpointIndex, file) => {
    try {
      // Create a unique folder path for each user's photos
      const folderPath = `users/${user.uid}/projects/${selectedProject}/${selectedSystem}/${floorId}/${doorId}`;
      
      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'workmate_preset');
      formData.append('folder', folderPath); // Set the folder path in Cloudinary
      
      // Log upload details for debugging
      console.log('Uploading to Cloudinary:', {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'workmate_preset',
        folder: folderPath,
        fileType: file.type,
        fileSize: file.size
      });

      // Upload to Cloudinary
      const response = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Cloudinary Error Response:', responseData);
        throw new Error(responseData.error?.message || 'Failed to upload image');
      }

      console.log('Upload successful:', responseData);
      
      // Store both the secure URL and the public ID for future reference
      const photoData = {
        url: responseData.secure_url,
        publicId: responseData.public_id,
        folder: folderPath,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.uid
      };

      // Update Firestore with the Cloudinary data
      const doorRef = doc(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floorId}/doors/${doorId}`);
      const doorDoc = await getDoc(doorRef);
      const checkpoints = doorDoc.data().checkpoints;
      checkpoints[checkpointIndex] = {
        ...checkpoints[checkpointIndex],
        completed: true,
        photo: photoData, // Store complete photo data instead of just URL
        completedAt: new Date().toISOString()
      };
      
      await updateDoc(doorRef, { checkpoints });
      fetchFloors();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert(`Upload failed: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDeleteFloor = async (floorId) => {
    if (!window.confirm('Are you sure you want to delete this floor and all its doors?')) return;

    try {
      const floorRef = doc(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floorId}`);
      await deleteDoc(floorRef);
      fetchFloors();
    } catch (error) {
      console.error('Error deleting floor:', error);
    }
  };

  const handleDeleteDoor = async (floorId, doorId) => {
    if (!window.confirm('Are you sure you want to delete this door?')) return;

    try {
      const doorRef = doc(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floorId}/doors/${doorId}`);
      await deleteDoc(doorRef);
      fetchFloors();
    } catch (error) {
      console.error('Error deleting door:', error);
    }
  };

  const toggleFloorExpansion = (floorId) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };

  const toggleDoorExpansion = (doorId) => {
    setExpandedDoors(prev => ({
      ...prev,
      [doorId]: !prev[doorId]
    }));
  };

  const handleCheckpointComplete = async (floorId, doorId, checkpointIndex, isCompleted) => {
    try {
      const doorRef = doc(db, `users/${user.uid}/projects/${selectedProject}/checklist/${selectedSystem}/floors/${floorId}/doors/${doorId}`);
      const doorDoc = await getDoc(doorRef);
      const checkpoints = doorDoc.data().checkpoints;
      checkpoints[checkpointIndex] = {
        ...checkpoints[checkpointIndex],
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
      };
      
      await updateDoc(doorRef, { checkpoints });
      fetchFloors();
    } catch (error) {
      console.error('Error updating checkpoint:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl font-bold text-gray-800">Installation Checklist</h1>
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
          <select
            value={selectedSystem}
            onChange={(e) => setSelectedSystem(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select System</option>
            {Object.keys(SYSTEM_TYPES).map((system) => (
              <option key={system} value={system}>
                {system}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsFloorModalOpen(true)}
            disabled={!selectedProject || !selectedSystem}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus size={16} />
            <span className="hidden sm:inline">Add Floor</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Floors List */}
      {selectedProject && selectedSystem && !loading && (
        <div className="space-y-4">
          {floors.map((floor) => (
            <div key={floor.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Floor Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleFloorExpansion(floor.id)}
              >
                <div className="flex items-center gap-2">
                  {expandedFloors[floor.id] ? <FaChevronDown /> : <FaChevronRight />}
                  <h3 className="font-semibold text-gray-800">{floor.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFloor(floor.id);
                      setIsDoorModalOpen(true);
                    }}
                    className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-blue-200 transition-colors"
                  >
                    <FaPlus size={12} />
                    <span className="text-sm">Add Door</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFloor(floor.id);
                    }}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              {/* Doors List */}
              {expandedFloors[floor.id] && checklistData[floor.id]?.map((door) => (
                <div key={door.id} className="border-t border-gray-100">
                  {/* Door Header */}
                  <div
                    className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleDoorExpansion(door.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedDoors[door.id] ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                      <h4 className="font-medium text-gray-700">Door {door.number}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {door.checkpoints.filter(cp => cp.completed).length} / {door.checkpoints.length} completed
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoor(floor.id, door.id);
                        }}
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Checkpoints */}
                  {expandedDoors[door.id] && (
                    <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {door.checkpoints.map((checkpoint, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            checkpoint.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={checkpoint.completed}
                                onChange={(e) => handleCheckpointComplete(floor.id, door.id, index, e.target.checked)}
                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <p className="text-sm text-gray-600">{checkpoint.name}</p>
                            </div>
                            {!checkpoint.completed && (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handlePhotoUpload(floor.id, door.id, index, e.target.files[0]);
                                    }
                                  }}
                                />
                                <FaCamera className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0" />
                              </label>
                            )}
                          </div>
                          {checkpoint.photo && (
                            <div className="mt-2">
                              <img
                                src={checkpoint.photo.url}
                                alt="Proof"
                                className="rounded-md w-full h-24 object-cover"
                              />
                              {checkpoint.completedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Completed: {new Date(checkpoint.completedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedProject && selectedSystem && !loading && floors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-600 mb-4">No floors added yet</p>
          <button
            onClick={() => setIsFloorModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FaPlus size={16} />
            Add Your First Floor
          </button>
        </div>
      )}

      {/* Floor Modal */}
      {isFloorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Floor</h2>
              <form onSubmit={handleAddFloor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor Name
                  </label>
                  <input
                    type="text"
                    value={newFloorName}
                    onChange={(e) => setNewFloorName(e.target.value)}
                    placeholder="e.g., Ground Floor, First Floor"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFloorModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Floor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Door Modal */}
      {isDoorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Add New Door</h2>
              <form onSubmit={handleAddDoor} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Door Number
                  </label>
                  <input
                    type="text"
                    value={newDoorNumber}
                    onChange={(e) => setNewDoorNumber(e.target.value)}
                    placeholder="e.g., D101, D102"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDoorModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Door
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

export default Checklist; 