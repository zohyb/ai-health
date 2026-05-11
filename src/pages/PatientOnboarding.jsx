import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { UserCheck, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PatientOnboarding = () => {
  const { currentUser, completePatientProfile, needsProfileSetup, logout } = useAuth();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: currentUser?.displayName || '',
    phone: '',
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (!needsProfileSetup) {
      navigate('/dashboard');
    }
  }, [currentUser, needsProfileSetup, navigate]);

  const updateData = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name || !profileData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await completePatientProfile(profileData);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5 mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-5"
          >
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2">Complete Your Profile</h2>
              <p className="text-secondary">Please provide your contact details for appointments.</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-semibold d-flex align-items-center gap-2">
                  <User size={16} /> Full Name
                </Form.Label>
                <input
                  type="text"
                  className="input-glass"
                  placeholder="John Doe"
                  value={profileData.name}
                  onChange={(e) => updateData('name', e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="text-secondary small fw-semibold d-flex align-items-center gap-2">
                  <Phone size={16} /> Phone Number
                </Form.Label>
                <input
                  type="tel"
                  className="input-glass"
                  placeholder="+1 234 567 8900"
                  value={profileData.phone}
                  onChange={(e) => updateData('phone', e.target.value)}
                  required
                />
                <Form.Text className="text-muted small">
                  Doctors will use this number to contact you regarding appointments.
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="btn btn-outline-secondary w-25 py-3 rounded-3 fw-semibold"
                  onClick={logout}
                  disabled={loading}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-75 py-3 d-flex justify-content-center align-items-center gap-2 border-0 rounded-3 fw-semibold"
                  type="submit"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #2e86c1, #1a5276)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(26, 82, 118, 0.3)',
                  }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <UserCheck size={18} /> Complete Profile
                    </>
                  )}
                </motion.button>
              </div>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default PatientOnboarding;
