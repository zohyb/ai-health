import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sign in with Email/Password
  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch profile and check if complete
    const userSnap = await getDoc(doc(db, 'users', result.user.uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      setPatientProfile(data);
      setNeedsProfileSetup(!data.phone || !data.name || data.name === 'Anonymous User');
    } else {
      await saveUserToFirestore(result.user);
    }
    return result;
  };

  // Sign up with Email/Password
  const signupWithEmail = async (email, password, additionalData) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // For detailed register form
    const userRef = doc(db, 'users', result.user.uid);
    const newProfile = {
      uid: result.user.uid,
      name: additionalData?.name || result.user.displayName || '',
      email: result.user.email,
      phone: additionalData?.phone || '',
      createdAt: new Date().toISOString()
    };
    await setDoc(userRef, newProfile, { merge: true });
    setPatientProfile(newProfile);
    
    if (!newProfile.name || !newProfile.phone) {
      setNeedsProfileSetup(true);
    } else {
      setNeedsProfileSetup(false);
    }
    
    return result;
  };

  const logout = () => {
    setPatientProfile(null);
    setNeedsProfileSetup(false);
    return signOut(auth);
  };

  // Save user profile to Firestore
  const saveUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const newProfile = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
        phone: '',
        createdAt: new Date().toISOString()
      };
      await setDoc(userRef, newProfile, { merge: true });
      setPatientProfile(newProfile);
      setNeedsProfileSetup(true);
    } else {
      const data = userSnap.data();
      setPatientProfile(data);
      setNeedsProfileSetup(!data.phone || !data.name || data.name === 'Anonymous User');
    }
  };

  const completePatientProfile = async (profileData) => {
    if (!currentUser) throw new Error("No user logged in");
    
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      name: profileData.name,
      phone: profileData.phone,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setPatientProfile(prev => ({...prev, ...profileData}));
    setNeedsProfileSetup(false);
  };

  useEffect(() => {
    // This only fires for patient auth (default Firebase app instance)
    // Doctor auth is on a separate instance so it won't interfere
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await saveUserToFirestore(user);
      } else {
        setCurrentUser(null);
        setPatientProfile(null);
        setNeedsProfileSetup(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    patientProfile,
    needsProfileSetup,
    loginWithEmail,
    signupWithEmail,
    logout,
    completePatientProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
