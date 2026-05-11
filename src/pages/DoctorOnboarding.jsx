import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Stethoscope, Award, Phone, Clock, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

const SPECIALIZATIONS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Pulmonology',
  'Dermatology', 'Gastroenterology', 'Orthopedics', 'ENT',
  'Endocrinology', 'Nephrology', 'Ophthalmology', 'Psychiatry',
  'Pediatrics', 'Gynecology', 'Urology', 'Oncology',
  'Radiology', 'Anesthesiology',
];

const DoctorOnboarding = () => {
  const { doctorUser, completeOnboarding, isDoctor, needsOnboarding, logoutDoctor } = useDoctor();
  const navigate = useNavigate();
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [regData, setRegData] = useState({
    name: doctorUser?.displayName || '',
    specialization: '',
    qualification: '',
    experience: '',
    phone: '',
    clinicTimings: {
      monday: { start: '09:00', end: '17:00', active: true },
      tuesday: { start: '09:00', end: '17:00', active: true },
      wednesday: { start: '09:00', end: '17:00', active: true },
      thursday: { start: '09:00', end: '17:00', active: true },
      friday: { start: '09:00', end: '17:00', active: true },
      saturday: { start: '10:00', end: '14:00', active: true },
      sunday: { start: '', end: '', active: false },
    }
  });

  useEffect(() => {
    // If not logged in, go to login
    if (!doctorUser) {
      navigate('/doctor/login');
    } else if (isDoctor && !needsOnboarding) {
      // If already onboarded, go to dashboard
      navigate('/doctor/dashboard');
    }
  }, [doctorUser, isDoctor, needsOnboarding, navigate]);

  const updateRegData = (field, value) => {
    setRegData(prev => ({ ...prev, [field]: value }));
  };

  const updateTiming = (day, field, value) => {
    setRegData(prev => ({
      ...prev,
      clinicTimings: {
        ...prev.clinicTimings,
        [day]: { ...prev.clinicTimings[day], [field]: value }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regData.specialization) {
      setError('Please select a specialization.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await completeOnboarding(regData);
      navigate('/doctor/dashboard');
    } catch (err) {
      console.error(err);
      setError(`Failed to save profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-5"
          >
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-2">Complete Your Profile</h2>
              <p className="text-secondary">Please provide your professional details to access the portal</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <h5 className="fw-semibold mb-4 d-flex align-items-center gap-2" style={{ color: '#2e86c1' }}>
                    <Stethoscope size={18} /> Personal Information
                  </h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-semibold">Full Name</Form.Label>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="Dr. John Smith"
                      value={regData.name}
                      onChange={(e) => updateRegData('name', e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-semibold d-flex align-items-center gap-1">
                      <Phone size={12} /> Phone Number
                    </Form.Label>
                    <input
                      type="tel"
                      className="input-glass"
                      placeholder="+92 300 1234567"
                      value={regData.phone}
                      onChange={(e) => updateRegData('phone', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <h5 className="fw-semibold mb-4 d-flex align-items-center gap-2" style={{ color: '#2e86c1' }}>
                    <Award size={18} /> Professional Details
                  </h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-semibold">Specialization</Form.Label>
                    <select
                      className="input-glass"
                      value={regData.specialization}
                      onChange={(e) => updateRegData('specialization', e.target.value)}
                      required
                    >
                      <option value="">Select Specialization</option>
                      {SPECIALIZATIONS.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-semibold">Qualification</Form.Label>
                    <input
                      type="text"
                      className="input-glass"
                      placeholder="MBBS, MD, FCPS..."
                      value={regData.qualification}
                      onChange={(e) => updateRegData('qualification', e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="text-secondary small fw-semibold">Experience (years)</Form.Label>
                    <input
                      type="number"
                      className="input-glass"
                      placeholder="e.g. 5"
                      min="0"
                      value={regData.experience}
                      onChange={(e) => updateRegData('experience', e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="mt-4">
                <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2" style={{ color: '#2e86c1' }}>
                  <Clock size={18} /> Clinic Timings
                </h5>
                <div className="glass-panel p-3" style={{ background: 'rgba(26, 82, 118, 0.03)' }}>
                  {Object.entries(regData.clinicTimings).map(([day, timing]) => (
                    <div key={day} className="d-flex align-items-center gap-3 py-2" style={{ borderBottom: day !== 'sunday' ? '1px solid var(--glass-border)' : 'none' }}>
                      <div className="d-flex align-items-center gap-2" style={{ minWidth: '130px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={timing.active}
                          onChange={(e) => updateTiming(day, 'active', e.target.checked)}
                          style={{ accentColor: '#2e86c1' }}
                        />
                        <span className={`fw-medium text-capitalize ${!timing.active ? 'text-secondary' : ''}`} style={{ fontSize: '0.9rem' }}>
                          {day}
                        </span>
                      </div>
                      {timing.active ? (
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="time"
                            className="input-glass py-1 px-2"
                            style={{ width: '120px', fontSize: '0.85rem' }}
                            value={timing.start}
                            onChange={(e) => updateTiming(day, 'start', e.target.value)}
                          />
                          <span className="text-secondary small">to</span>
                          <input
                            type="time"
                            className="input-glass py-1 px-2"
                            style={{ width: '120px', fontSize: '0.85rem' }}
                            value={timing.end}
                            onChange={(e) => updateTiming(day, 'end', e.target.value)}
                          />
                        </div>
                      ) : (
                        <span className="text-secondary small fst-italic">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="btn btn-outline-secondary w-25 py-3 rounded-3 fw-semibold"
                  onClick={logoutDoctor}
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
                    background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
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

export default DoctorOnboarding;
