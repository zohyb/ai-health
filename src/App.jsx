import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDoctor } from './context/DoctorContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientOnboarding from './pages/PatientOnboarding';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import DoctorLogin from './pages/DoctorLogin';
import DoctorOnboarding from './pages/DoctorOnboarding';
import DoctorDashboard from './pages/DoctorDashboard';
import BookAppointment from './pages/BookAppointment';

// Protected Route Component (Patient)
const ProtectedRoute = ({ children }) => {
  const { currentUser, needsProfileSetup, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <span className="spinner-border" style={{ color: '#2e86c1' }} />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  if (needsProfileSetup) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
};

// Protected Route Component (Doctor)
const DoctorProtectedRoute = ({ children }) => {
  const { doctorUser, isDoctor, needsOnboarding, loading, doctorProfile } = useDoctor();
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <span className="spinner-border" style={{ color: '#2e86c1' }} />
      </div>
    );
  }
  
  if (!doctorUser) {
    return <Navigate to="/doctor/login" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/doctor/onboarding" replace />;
  }
  
  if (isDoctor && doctorProfile) {
    return children;
  }
  
  return <Navigate to="/doctor/login" replace />;
};

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="app-container">
      {!isHomePage && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<PatientOnboarding />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/symptom-checker" 
            element={
              <ProtectedRoute>
                <SymptomChecker />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />
          {/* Doctor Routes */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/onboarding" element={<DoctorOnboarding />} />
          <Route 
            path="/doctor/dashboard" 
            element={
              <DoctorProtectedRoute>
                <DoctorDashboard />
              </DoctorProtectedRoute>
            } 
          />
          {/* Catch-all: any other /doctor/* path redirects to login */}
          <Route path="/doctor/*" element={<Navigate to="/doctor/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
