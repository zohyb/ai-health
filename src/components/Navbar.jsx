import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Container, Navbar as BootstrapNavbar, Nav } from 'react-bootstrap';
import { Activity, User, LogOut, Sun, Moon, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useDoctor } from '../context/DoctorContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDoctor, doctorProfile, doctorUser, logoutDoctor } = useDoctor();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const isDoctorPage = location.pathname.startsWith('/doctor');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-bg');
    } else {
      document.body.classList.remove('light-bg');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleDoctorLogout = async () => {
    try {
      await logoutDoctor();
      navigate('/doctor/login');
    } catch (error) {
      console.error('Failed to log out doctor', error);
    }
  };

  return (
    <BootstrapNavbar expand="lg" className="glass-panel mx-3 mt-3 mb-4" variant={theme === 'dark' ? 'dark' : 'light'} style={{ border: '1px solid var(--glass-border)' }}>
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
          <div 
            className="d-flex align-items-center justify-content-center rounded-circle" 
            style={{ 
              width: '45px', 
              height: '45px', 
              background: isDoctorPage 
                ? 'linear-gradient(135deg, #1a5276, #2e86c1)' 
                : 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              boxShadow: isDoctorPage
                ? (theme === 'dark' ? '0 0 15px rgba(46, 134, 193, 0.4)' : '0 0 10px rgba(26, 82, 118, 0.2)')
                : (theme === 'dark' ? '0 0 15px rgba(128, 0, 0, 0.4)' : '0 0 10px rgba(128, 0, 0, 0.2)')
            }}
          >
            {isDoctorPage ? <Stethoscope size={24} color="white" /> : <Activity size={24} color="white" />}
          </div>
          <span className={`font-weight-bold ${isDoctorPage ? 'doctor-gradient-text' : 'gradient-text'}`} style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {isDoctorPage ? 'Doctor Portal' : 'AI Health Portal'}
          </span>
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="btn-secondary-glass border-0 bg-transparent p-2 me-3"
              style={{ color: 'var(--text-primary)' }}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {currentUser && !isDoctorPage && (
              <>
                <Nav.Link as={Link} to="/dashboard" className="px-3" style={{ color: 'var(--nav-text)' }}>Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/symptom-checker" className="px-3" style={{ color: 'var(--nav-text)' }}>Symptom Checker</Nav.Link>
                <Nav.Link as={Link} to="/book-appointment" className="px-3" style={{ color: 'var(--nav-text)' }}>Appointments</Nav.Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button onClick={handleLogout} className="btn-secondary-glass ms-3 d-flex align-items-center gap-2 border-0 bg-transparent" style={{ color: 'var(--nav-text)' }}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}

            {/* Doctor Portal Link — only visible if not logged in as patient */}
            {!isDoctorPage && !currentUser && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  to={isDoctor ? "/doctor/dashboard" : "/doctor/login"} 
                  className="text-decoration-none ms-3 d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                  style={{ 
                    background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    boxShadow: '0 3px 12px rgba(26, 82, 118, 0.25)',
                  }}
                >
                  <Stethoscope size={16} />
                  <span>Doctor Portal</span>
                </Link>
              </motion.div>
            )}

            {isDoctorPage && doctorUser && (
              <>
                <Nav.Link as={Link} to="/doctor/dashboard" className="px-3" style={{ color: 'var(--nav-text)' }}>Dashboard</Nav.Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button onClick={handleDoctorLogout} className="btn-secondary-glass ms-3 d-flex align-items-center gap-2 border-0 bg-transparent" style={{ color: 'var(--nav-text)' }}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </motion.div>
              </>
            )}



            {!currentUser && !isDoctorPage && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn-primary-glass text-decoration-none ms-3 d-flex align-items-center gap-2">
                  <User size={18} />
                  <span>Login</span>
                </Link>
              </motion.div>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
