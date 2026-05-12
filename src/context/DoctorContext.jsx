import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';
import { doctorAuth, doctorDb } from '../services/firebase';

const DoctorContext = createContext();

export const useDoctor = () => useContext(DoctorContext);

export const DoctorProvider = ({ children }) => {
  const [doctorUser, setDoctorUser] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Email/Password Signup
  const signupDoctor = async (email, password) => {
    const result = await createUserWithEmailAndPassword(doctorAuth, email, password);
    setDoctorUser(result.user);
    setNeedsOnboarding(true);
    return result;
  };

  // Login as doctor
  const loginDoctor = async (email, password) => {
    const result = await signInWithEmailAndPassword(doctorAuth, email, password);
    const user = result.user;
    
    try {
      const doctorDoc = await getDoc(doc(doctorDb, 'doctors', user.uid));
      if (doctorDoc.exists()) {
        setDoctorUser(user);
        setDoctorProfile(doctorDoc.data());
        setIsDoctor(true);
        setNeedsOnboarding(false);
      } else {
        setDoctorUser(user);
        setNeedsOnboarding(true);
      }
    } catch (err) {
      console.warn('Could not verify doctor profile on login:', err.message);
      setDoctorUser(user);
      setNeedsOnboarding(true);
    }
    return result;
  };

  // Complete onboarding
  const completeOnboarding = async (profileData) => {
    if (!doctorUser) throw new Error("No user logged in");
    
    const doctorData = {
      uid: doctorUser.uid,
      email: doctorUser.email,
      name: profileData.name || doctorUser.displayName || '',
      specialization: profileData.specialization || '',
      qualification: profileData.qualification || '',
      experience: profileData.experience || '',
      phone: profileData.phone || '',
      clinicTimings: profileData.clinicTimings || {},
      isDoctor: true,
      isAvailable: true,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(doctorDb, 'doctors', doctorUser.uid), doctorData);
    setDoctorProfile(doctorData);
    setIsDoctor(true);
    setNeedsOnboarding(false);
  };

  // Logout
  const logoutDoctor = () => {
    setDoctorProfile(null);
    setDoctorUser(null);
    setIsDoctor(false);
    setNeedsOnboarding(false);
    return signOut(doctorAuth);
  };

  // Get all registered doctors (for patient browsing)
  const getAllDoctors = async () => {
    try {
      const q = query(collection(doctorDb, 'doctors'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching doctors:', err);
      return [];
    }
  };

  // Get doctors by specialization
  const getDoctorsBySpecialization = async (specialization) => {
    try {
      const q = query(
        collection(doctorDb, 'doctors'),
        where('specialization', '==', specialization),
        where('isAvailable', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Error fetching doctors by specialization:', err);
      return [];
    }
  };

  // Book an appointment
  const bookAppointment = async (appointmentData) => {
    const docRef = await addDoc(collection(doctorDb, 'appointments'), {
      ...appointmentData,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  };

  // Get appointments for a doctor
  const getDoctorAppointments = async (doctorId) => {
    try {
      const q = query(
        collection(doctorDb, 'appointments'),
        where('doctorId', '==', doctorId)
      );
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      appointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      return appointments;
    } catch (err) {
      console.error('Error fetching appointments:', err);
      return [];
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId, status) => {
    await updateDoc(doc(doctorDb, 'appointments', appointmentId), { status });
  };

  // Find matching doctor for a diagnosis specialization
  const findDoctorForCondition = async (condition) => {
    const conditionToSpecialization = {
      'heart attack': 'Cardiology',
      'hypertension': 'Cardiology',
      'chest pain': 'Cardiology',
      'arrhythmia': 'Cardiology',
      'heart failure': 'Cardiology',
      'coronary artery disease': 'Cardiology',
      'angina': 'Cardiology',
      'stroke': 'Neurology',
      'migraine': 'Neurology',
      'epilepsy': 'Neurology',
      'meningitis': 'Neurology',
      'brain tumor': 'Neurology',
      'seizure': 'Neurology',
      'neuropathy': 'Neurology',
      'pneumonia': 'Pulmonology',
      'asthma': 'Pulmonology',
      'bronchitis': 'Pulmonology',
      'tuberculosis': 'Pulmonology',
      'copd': 'Pulmonology',
      'lung infection': 'Pulmonology',
      'eczema': 'Dermatology',
      'psoriasis': 'Dermatology',
      'acne': 'Dermatology',
      'skin infection': 'Dermatology',
      'dermatitis': 'Dermatology',
      'rash': 'Dermatology',
      'skin cancer': 'Dermatology',
      'gastritis': 'Gastroenterology',
      'appendicitis': 'Gastroenterology',
      'liver disease': 'Gastroenterology',
      'ulcer': 'Gastroenterology',
      'hepatitis': 'Gastroenterology',
      'ibs': 'Gastroenterology',
      'fracture': 'Orthopedics',
      'arthritis': 'Orthopedics',
      'bone infection': 'Orthopedics',
      'osteoporosis': 'Orthopedics',
      'scoliosis': 'Orthopedics',
      'sinusitis': 'ENT',
      'tonsillitis': 'ENT',
      'ear infection': 'ENT',
      'hearing loss': 'ENT',
      'diabetes': 'Endocrinology',
      'thyroid': 'Endocrinology',
      'hormonal imbalance': 'Endocrinology',
      'kidney disease': 'Nephrology',
      'kidney stones': 'Nephrology',
      'urinary tract infection': 'Nephrology',
      'fever': 'General Medicine',
      'flu': 'General Medicine',
      'cold': 'General Medicine',
      'infection': 'General Medicine',
      'covid': 'General Medicine',
      'malaria': 'General Medicine',
      'dengue': 'General Medicine',
      'typhoid': 'General Medicine',
    };

    const conditionLower = condition.toLowerCase();
    let matchedSpec = 'General Medicine';

    for (const [key, spec] of Object.entries(conditionToSpecialization)) {
      if (conditionLower.includes(key)) {
        matchedSpec = spec;
        break;
      }
    }

    const doctors = await getDoctorsBySpecialization(matchedSpec);
    
    if (doctors.length > 0) {
      return { doctor: doctors[0], specialization: matchedSpec, found: true };
    }

    if (matchedSpec !== 'General Medicine') {
      const generalDoctors = await getDoctorsBySpecialization('General Medicine');
      if (generalDoctors.length > 0) {
        return { doctor: generalDoctors[0], specialization: 'General Medicine', found: true };
      }
    }

    return { doctor: null, specialization: matchedSpec, found: false };
  };

  useEffect(() => {
    // This only fires for doctor auth (separate 'doctor-app' Firebase instance)
    // Patient auth is on the default instance so it won't interfere
    const unsubscribe = onAuthStateChanged(doctorAuth, async (user) => {
      if (user) {
        setDoctorUser(user);
        try {
          const doctorDoc = await getDoc(doc(doctorDb, 'doctors', user.uid));
          if (doctorDoc.exists()) {
            setDoctorProfile(doctorDoc.data());
            setIsDoctor(true);
            setNeedsOnboarding(false);
          } else {
            setDoctorProfile(null);
            setIsDoctor(false);
            setNeedsOnboarding(true);
          }
        } catch (err) {
          console.log('Doctor profile check skipped (not a doctor or permissions pending)');
          setDoctorProfile(null);
          setIsDoctor(false);
          setNeedsOnboarding(true);
        }
      } else {
        setDoctorUser(null);
        setDoctorProfile(null);
        setIsDoctor(false);
        setNeedsOnboarding(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    doctorUser,
    doctorProfile,
    isDoctor,
    needsOnboarding,
    loading,
    signupDoctor,
    loginDoctor,
    logoutDoctor,
    completeOnboarding,
    getAllDoctors,
    getDoctorsBySpecialization,
    bookAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
    findDoctorForCondition
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};
