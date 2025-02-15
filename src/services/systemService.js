import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const COLLECTION_NAME = 'systems';

export const systemService = {
  // Create a new system
  async createSystem(systemData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...systemData,
        createdAt: new Date(),
        updatedAt: new Date(),
        completionRate: 0
      });
      return { id: docRef.id, ...systemData };
    } catch (error) {
      throw new Error(`Error creating system: ${error.message}`);
    }
  },

  // Get all systems
  async getSystems() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching systems: ${error.message}`);
    }
  },

  // Get systems by project ID
  async getSystemsByProject(projectId) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("projectId", "==", projectId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching systems by project: ${error.message}`);
    }
  },

  // Get a single system by ID
  async getSystemById(systemId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, systemId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('System not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      throw new Error(`Error fetching system: ${error.message}`);
    }
  },

  // Update a system
  async updateSystem(systemId, updateData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, systemId);
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
      return { id: systemId, ...updateData };
    } catch (error) {
      throw new Error(`Error updating system: ${error.message}`);
    }
  },

  // Update system completion rate
  async updateCompletionRate(systemId, completionRate) {
    try {
      const docRef = doc(db, COLLECTION_NAME, systemId);
      await updateDoc(docRef, {
        completionRate,
        updatedAt: new Date()
      });
      return { id: systemId, completionRate };
    } catch (error) {
      throw new Error(`Error updating system completion rate: ${error.message}`);
    }
  },

  // Delete a system
  async deleteSystem(systemId) {
    try {
      const docRef = doc(db, COLLECTION_NAME, systemId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      throw new Error(`Error deleting system: ${error.message}`);
    }
  }
}; 