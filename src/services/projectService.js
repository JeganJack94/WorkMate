import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { auth } from '../firebase/firebaseConfig';

const getProjectsCollection = (userId) => {
  return collection(db, `users/${userId}/projects`);
};

export const projectService = {
  // Create a new project
  async createProject(projectData) {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const docRef = await addDoc(getProjectsCollection(userId), {
        ...projectData,
        createdAt: new Date().toISOString(),
        status: 'active',
        userId
      });
      return { id: docRef.id, ...projectData };
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  },

  // Get all projects
  async getProjects() {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const q = query(getProjectsCollection(userId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  },

  // Get a single project by ID
  async getProjectById(projectId) {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const docRef = doc(db, `users/${userId}/projects`, projectId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  },

  // Update a project
  async updateProject(projectId, updateData) {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const docRef = doc(db, `users/${userId}/projects`, projectId);
      await updateDoc(docRef, updateData);
      return { id: projectId, ...updateData };
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  },

  // Delete a project
  async deleteProject(projectId) {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const docRef = doc(db, `users/${userId}/projects`, projectId);
      await deleteDoc(docRef);
      return projectId;
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  },

  // Get projects by status
  async getProjectsByStatus(status) {
    try {
      if (!auth.currentUser) throw new Error('User must be authenticated');
      const userId = auth.currentUser.uid;
      const q = query(
        getProjectsCollection(userId),
        where("status", "==", status)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error(`Error fetching projects by status: ${error.message}`);
    }
  }
};