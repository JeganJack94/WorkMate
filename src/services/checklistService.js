import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const COLLECTION_NAME = 'checklists';

export const checklistService = {
  async getChecklists(projectId, system) {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('projectId', '==', projectId),
        where('system', '==', system)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting checklists:', error);
      throw error;
    }
  },

  async addChecklistItem(checklistData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...checklistData,
        completed: false,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding checklist item:', error);
      throw error;
    }
  },

  async updateChecklistItem(id, checklistData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...checklistData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating checklist item:', error);
      throw error;
    }
  },

  async deleteChecklistItem(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  },

  async toggleChecklistItem(id, completed) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        completed,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error toggling checklist item:', error);
      throw error;
    }
  }
};