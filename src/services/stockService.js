import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'stocks';

export const stockService = {
  async getStocks(projectId, system) {
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
      console.error('Error getting stocks:', error);
      throw error;
    }
  },

  async addStock(stockData) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...stockData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding stock:', error);
      throw error;
    }
  },

  async updateStock(id, stockData) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...stockData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      throw error;
    }
  },

  async deleteStock(id) {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error;
    }
  }
};

export const addStock = async (stockData) => {
  try {
    const docRef = await addDoc(collection(db, 'stocks'), {
      ...stockData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Record initial history entry
    await addDoc(collection(db, 'stockHistory'), {
      stockId: docRef.id,
      supplied: stockData.supplied,
      installed: stockData.installed,
      attic: stockData.attic,
      timestamp: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    throw new Error('Error adding stock: ' + error.message);
  }
};

export const updateStock = async (stockId, updateData) => {
  try {
    const stockRef = doc(db, 'stocks', stockId);
    await updateDoc(stockRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    // Record history entry for the update
    await addDoc(collection(db, 'stockHistory'), {
      stockId,
      ...updateData,
      timestamp: serverTimestamp()
    });

    return stockId;
  } catch (error) {
    throw new Error('Error updating stock: ' + error.message);
  }
};

export const getStockHistory = async (stockId) => {
  try {
    const historyQuery = query(
      collection(db, 'stockHistory'),
      where('stockId', '==', stockId)
    );
    const snapshot = await getDocs(historyQuery);
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    throw new Error('Error fetching stock history: ' + error.message);
  }
};

export const getStocks = async (systemId = null) => {
  try {
    let stocksQuery;
    if (systemId) {
      stocksQuery = query(
        collection(db, 'stocks'), 
        where('systemId', '==', systemId)
      );
    } else {
      stocksQuery = collection(db, 'stocks');
    }
    const snapshot = await getDocs(stocksQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw new Error('Error fetching stocks: ' + error.message);
  }
};