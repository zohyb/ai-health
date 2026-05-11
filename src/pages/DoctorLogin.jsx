import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, UserPlus, LogIn, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

const DoctorLogin = () => {
  const { signupDoctor, loginDoctor, loginWithGoogleDoctor, doctorUser, isDoctor, needsOnboarding, loading } = useDoctor();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in and onboarded
  useEffect(() => {
    if (!loading && doctorUser) {
      if (needsOnboarding) {
        navigate('/doctor/onboarding');
      } else if (isDoctor) {
        navigate('/doctor/dashboard');
      }
    }
  }, [doctorUser, isDoctor, needsOnboarding, navigate, loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <span className="spinner-border" style={{ color: '#2e86c1' }} />
      </div>
    );
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setFormLoading(true);
      if (activeTab === 'login') {
        await loginDoctor(email, password);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setFormLoading(false);
          return;
        }
        await signupDoctor(email, password);
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('No account found with these credentials or wrong password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(`${activeTab === 'login' ? 'Login' : 'Registration'} failed: ${err.message}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError('');
      setFormLoading(true);
      await loginWithGoogleDoctor();
    } catch (err) {
      console.error(err);
      setError(`Google Auth failed: ${err.message}`);
      setFormLoading(false);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ 
                  width: '70px', height: '70px',
                  background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                  boxShadow: '0 8px 25px rgba(26, 82, 118, 0.3)'
                }}
              >
                <Stethoscope size={34} color="white" />
              </div>
              <h2 className="fw-bold mb-2">Doctor Portal</h2>
              <p className="text-secondary">Sign in or register to access the doctor dashboard</p>
            </div>

            {/* Tab Switcher */}
            <div className="d-flex justify-content-center gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-pill border-0 fw-semibold d-flex align-items-center gap-2 ${activeTab === 'login' ? 'doctor-tab-active' : 'doctor-tab-inactive'}`}
                onClick={() => { setActiveTab('login'); setError(''); }}
                style={{
                  background: activeTab === 'login' ? 'linear-gradient(135deg, #1a5276, #2e86c1)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'login' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              >
                <LogIn size={16} /> Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-pill border-0 fw-semibold d-flex align-items-center gap-2`}
                onClick={() => { setActiveTab('register'); setError(''); }}
                style={{
                  background: activeTab === 'register' ? 'linear-gradient(135deg, #1a5276, #2e86c1)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === 'register' ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.3s ease',
                }}
              >
                <UserPlus size={16} /> Register
              </motion.button>
            </div>

            {error && <Alert variant="danger" className="animate-fade-in">{error}</Alert>}

            <div className="glass-panel p-4 p-md-5">
              <Form onSubmit={handleEmailAuth}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary small fw-semibold text-uppercase d-flex align-items-center gap-2">
                    <Mail size={14} /> Email Address
                  </Form.Label>
                  <input
                    type="email"
                    className="input-glass"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="text-secondary small fw-semibold text-uppercase d-flex align-items-center gap-2">
                    <Lock size={14} /> Password
                  </Form.Label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-100 py-3 mb-3 d-flex justify-content-center align-items-center gap-2 border-0 rounded-3 fw-semibold"
                  type="submit"
                  disabled={formLoading}
                  style={{
                    background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(26, 82, 118, 0.3)',
                  }}
                >
                  {formLoading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      {activeTab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                      {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                    </>
                  )}
                </motion.button>
              </Form>

              <div className="position-relative my-4 text-center">
                <hr style={{ borderColor: 'var(--glass-border)' }} />
                <span className="position-absolute top-50 start-50 translate-middle px-3 small text-secondary" style={{ background: 'var(--bg-primary)' }}>
                  OR
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleAuth}
                disabled={formLoading}
                className="w-100 py-3 d-flex justify-content-center align-items-center gap-2 rounded-3 fw-semibold bg-white text-dark border-0"
                style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
                Continue with Google
              </motion.button>
            </div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorLogin;
