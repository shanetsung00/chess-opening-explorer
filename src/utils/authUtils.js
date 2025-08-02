// utils/authUtils.js
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export const LIMITS = {
  MAX_REPERTOIRES_PER_USER: 10,
  MAX_OPENINGS_PER_REPERTOIRE: 100
};

// Authentication functions
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logOut = () => signOut(auth);

// User data management
export const createUserDocument = async (user) => {
  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      createdAt: new Date(),
      repertoires: []
    });
  }
  return userDoc;
};

// Repertoire management
export const createRepertoire = async (userId, repertoireData) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  if (userData.repertoires.length >= LIMITS.MAX_REPERTOIRES_PER_USER) {
    throw new Error(`Maximum ${LIMITS.MAX_REPERTOIRES_PER_USER} repertoires allowed`);
  }
  
  const newRepertoire = {
    id: `repertoire_${Date.now()}`,
    name: repertoireData.name,
    description: repertoireData.description || '',
    openings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const updatedRepertoires = [...userData.repertoires, newRepertoire];
  
  await updateDoc(userRef, {
    repertoires: updatedRepertoires
  });
  
  return newRepertoire;
};

export const updateRepertoireName = async (userId, repertoireId, newName) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  const updatedRepertoires = userData.repertoires.map(rep => 
    rep.id === repertoireId 
      ? { ...rep, name: newName, updatedAt: new Date() }
      : rep
  );
  
  await updateDoc(userRef, {
    repertoires: updatedRepertoires
  });
};

export const addOpeningToRepertoire = async (userId, repertoireId, openingId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  const repertoire = userData.repertoires.find(rep => rep.id === repertoireId);
  
  if (!repertoire) throw new Error('Repertoire not found');
  if (repertoire.openings.length >= LIMITS.MAX_OPENINGS_PER_REPERTOIRE) {
    throw new Error(`Maximum ${LIMITS.MAX_OPENINGS_PER_REPERTOIRE} openings per repertoire`);
  }
  if (repertoire.openings.includes(openingId)) {
    throw new Error('Opening already in repertoire');
  }
  
  const updatedRepertoires = userData.repertoires.map(rep => 
    rep.id === repertoireId 
      ? { 
          ...rep, 
          openings: [...rep.openings, openingId],
          updatedAt: new Date() 
        }
      : rep
  );
  
  await updateDoc(userRef, {
    repertoires: updatedRepertoires
  });
};

export const removeOpeningFromRepertoire = async (userId, repertoireId, openingId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  const updatedRepertoires = userData.repertoires.map(rep => 
    rep.id === repertoireId 
      ? { 
          ...rep, 
          openings: rep.openings.filter(id => id !== openingId),
          updatedAt: new Date() 
        }
      : rep
  );
  
  await updateDoc(userRef, {
    repertoires: updatedRepertoires
  });
};

export const deleteRepertoire = async (userId, repertoireId) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  const updatedRepertoires = userData.repertoires.filter(rep => rep.id !== repertoireId);
  
  await updateDoc(userRef, {
    repertoires: updatedRepertoires
  });
};

// Migration from localStorage favorites
export const migrateFavoritesToRepertoire = async (userId, favorites) => {
  if (favorites.length === 0) return;
  
  const defaultRepertoire = {
    name: "My Favorites",
    description: "Migrated from favorites"
  };
  
  const repertoire = await createRepertoire(userId, defaultRepertoire);
  
  // Add favorites to the new repertoire
  for (const openingId of favorites) {
    try {
      await addOpeningToRepertoire(userId, repertoire.id, openingId);
    } catch (error) {
      console.warn(`Failed to migrate opening ${openingId}:`, error);
    }
  }
  
  return repertoire;
};