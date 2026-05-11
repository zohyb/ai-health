import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Stethoscope, AlertTriangle, CheckCircle, 
  Search, MapPin, Phone, Award, Briefcase, Building2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDoctor } from '../context/DoctorContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BookAppointment = () => {
  const { currentUser, patientProfile } = useAuth();
  const { getAllDoctors, bookAppointment, findDoctorForCondition } = useDoctor();
  const location = useLocation();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNote, setBookingNote] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [autoBookResult, setAutoBookResult] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  // Check for auto-booking from symptom checker
  const diagnosisData = location.state?.diagnosisData;
  const autoBook = location.state?.autoBook;

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const allDoctors = await getAllDoctors();
        setDoctors(allDoctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Auto-book when redirected from high-risk diagnosis
  useEffect(() => {
    if (autoBook && diagnosisData && currentUser && doctors.length > 0) {
      handleAutoBook();
    }
  }, [autoBook, diagnosisData, currentUser, doctors]);

  const handleAutoBook = async () => {
    if (!diagnosisData || !currentUser) return;

    const topCondition = diagnosisData.topPredictions?.[0]?.disease || '';
    const result = await findDoctorForCondition(topCondition);

    if (result.found) {
      // Auto-book the appointment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      try {
        const appointmentId = await bookAppointment({
          doctorId: result.doctor.uid,
          doctorName: result.doctor.name,
          doctorSpecialization: result.doctor.specialization,
          patientId: currentUser.uid,
          patientName: patientProfile?.name || currentUser.displayName || 'Patient',
          patientEmail: patientProfile?.email || currentUser.email,
          patientPhone: patientProfile?.phone || '',
          appointmentDate: dateStr,
          appointmentTime: result.doctor.clinicTimings?.monday?.start || '10:00',
          condition: topCondition,
          symptoms: diagnosisData.symptoms || '',
          riskLevel: diagnosisData.riskLevel,
          note: `Auto-booked due to ${diagnosisData.riskLevel}. AI Diagnosis: ${topCondition}`,
          autoBooked: true,
        });

        setAutoBookResult({
          doctor: result.doctor,
          specialization: result.specialization,
          appointmentDate: dateStr,
          appointmentId,
          condition: topCondition,
        });
      } catch (err) {
        console.error('Auto-book failed:', err);
      }
    } else {
      // No doctor found — emergency alert
      setEmergencyAlert({
        specialization: result.specialization,
        condition: topCondition,
        riskLevel: diagnosisData.riskLevel,
      });
    }
  };

  const handleManualBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate || !bookingTime || !currentUser) return;

    setIsBooking(true);
    try {
      const appointmentId = await bookAppointment({
        doctorId: selectedDoctor.uid,
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        patientId: currentUser.uid,
        patientName: patientProfile?.name || currentUser.displayName || 'Patient',
        patientEmail: patientProfile?.email || currentUser.email,
        patientPhone: patientProfile?.phone || '',
        appointmentDate: bookingDate,
        appointmentTime: bookingTime,
        condition: diagnosisData?.topPredictions?.[0]?.disease || bookingNote || 'General Checkup',
        symptoms: diagnosisData?.symptoms || '',
        riskLevel: diagnosisData?.riskLevel || 'N/A',
        note: bookingNote,
        autoBooked: false,
      });

      setBookingSuccess({
        doctor: selectedDoctor,
        date: bookingDate,
        time: bookingTime,
        appointmentId,
      });
      setSelectedDoctor(null);
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsBooking(false);
    }
  };

  const filteredDoctors = doctors.filter(doc => {
    const matchSearch = doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpec = selectedSpec ? doc.specialization === selectedSpec : true;
    return matchSearch && matchSpec;
  });

  const specializations = [...new Set(doctors.map(d => d.specialization))].sort();
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Container className="py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <Link to="/dashboard" className="btn-secondary-glass d-flex align-items-center gap-1 text-decoration-none px-3 py-2">
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h2 className="fw-bold mb-0">Book Appointment</h2>
          <p className="text-secondary mb-0 small">Find a specialist and schedule your visit</p>
        </div>
      </div>

      {/* Emergency Alert - No Doctor Found */}
      <AnimatePresence>
        {emergencyAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-4 mb-4"
            style={{ 
              background: 'rgba(239, 68, 68, 0.08)', 
              borderColor: 'rgba(239, 68, 68, 0.3)',
              border: '2px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <div className="bg-danger bg-opacity-25 p-3 rounded-circle" style={{ flexShrink: 0 }}>
                <AlertTriangle size={28} className="text-danger" />
              </div>
              <div>
                <h4 className="fw-bold text-danger mb-2">⚠️ Emergency — No Specialist Available</h4>
                <p className="mb-2">
                  Your diagnosis indicates <strong>{emergencyAlert.condition}</strong> with risk level 
                  <Badge bg="danger" className="ms-2 rounded-pill">{emergencyAlert.riskLevel}</Badge>
                </p>
                <p className="mb-3">
                  Unfortunately, <strong>no {emergencyAlert.specialization} specialist</strong> is currently registered on our platform.
                </p>
                <div className="glass-panel p-3" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                  <h6 className="fw-bold mb-2 d-flex align-items-center gap-2">
                    <Building2 size={16} className="text-danger" /> Immediate Action Required
                  </h6>
                  <ul className="mb-0 ps-3">
                    <li className="mb-1">Please visit the <strong>nearest hospital emergency department</strong> immediately.</li>
                    <li className="mb-1">Carry your diagnosis report with you for reference.</li>
                    <li className="mb-1">Call <strong>1122</strong> (Rescue) or <strong>115</strong> (Ambulance) if you need emergency transport.</li>
                    <li>Do not delay seeking medical attention.</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Book Success */}
      <AnimatePresence>
        {autoBookResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-panel p-4 mb-4"
            style={{ 
              background: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div className="d-flex align-items-start gap-3">
              <div className="bg-success bg-opacity-25 p-3 rounded-circle" style={{ flexShrink: 0 }}>
                <CheckCircle size={28} className="text-success" />
              </div>
              <div>
                <h4 className="fw-bold text-success mb-2">✅ Appointment Auto-Booked!</h4>
                <p className="text-secondary mb-3">
                  Based on your <strong>{diagnosisData?.riskLevel}</strong> diagnosis for <strong>{autoBookResult.condition}</strong>, 
                  we've automatically booked an appointment for you.
                </p>
                <Row className="g-3">
                  <Col sm={6}>
                    <div className="glass-panel p-3">
                      <span className="text-secondary small">Doctor</span>
                      <p className="fw-semibold mb-0 d-flex align-items-center gap-2">
                        <Stethoscope size={14} style={{ color: '#2e86c1' }} />
                        {autoBookResult.doctor.name}
                      </p>
                      <span className="text-secondary small">{autoBookResult.specialization}</span>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <div className="glass-panel p-3">
                      <span className="text-secondary small">Appointment Date</span>
                      <p className="fw-semibold mb-0 d-flex align-items-center gap-2">
                        <Calendar size={14} style={{ color: '#2e86c1' }} />
                        {new Date(autoBookResult.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </Col>
                </Row>
                <div className="mt-3">
                  <Link to="/dashboard" className="btn-primary-glass text-decoration-none d-inline-flex align-items-center gap-2">
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manual Booking Success */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 mb-4"
            style={{ 
              background: 'rgba(16, 185, 129, 0.08)',
              border: '2px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <div className="text-center">
              <CheckCircle size={48} className="text-success mb-3" />
              <h4 className="fw-bold text-success">Appointment Booked Successfully!</h4>
              <p className="text-secondary">
                Your appointment with <strong>{bookingSuccess.doctor.name}</strong> on{' '}
                <strong>{new Date(bookingSuccess.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</strong>{' '}
                at <strong>{bookingSuccess.time}</strong> has been confirmed.
              </p>
              <div className="d-flex gap-3 justify-content-center mt-3">
                <button className="btn-primary-glass" onClick={() => setBookingSuccess(null)}>Book Another</button>
                <Link to="/dashboard" className="btn-secondary-glass text-decoration-none">Go to Dashboard</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagnosis Context */}
      {diagnosisData && !autoBookResult && !emergencyAlert && (
        <div className="glass-panel p-3 mb-4 d-flex align-items-center gap-3" style={{ background: 'rgba(26, 82, 118, 0.05)' }}>
          <AlertTriangle size={20} className={`text-${diagnosisData.riskLevel?.toLowerCase().includes('high') ? 'danger' : 'warning'}`} />
          <div className="flex-grow-1">
            <span className="small fw-medium">Booking based on AI diagnosis:</span>
            <span className="ms-2 small text-secondary">{diagnosisData.topPredictions?.[0]?.disease}</span>
          </div>
          <Badge bg={diagnosisData.riskLevel?.toLowerCase().includes('high') ? 'danger' : 'warning'} className="rounded-pill">
            {diagnosisData.riskLevel}
          </Badge>
        </div>
      )}

      {!bookingSuccess && (
        <Row>
          {/* Doctor List */}
          <Col lg={selectedDoctor ? 6 : 12}>
            {/* Search & Filter */}
            <div className="d-flex gap-3 mb-4 flex-wrap">
              <div className="position-relative flex-grow-1">
                <Search size={16} className="position-absolute text-secondary" style={{ left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="input-glass ps-5"
                  placeholder="Search doctors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="input-glass"
                style={{ width: 'auto', minWidth: '180px' }}
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="text-center py-5 text-secondary">
                <span className="spinner-border spinner-border-sm me-2" /> Loading doctors...
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="glass-panel p-5 text-center">
                <Stethoscope size={40} className="text-secondary mb-3 mx-auto d-block" style={{ opacity: 0.4 }} />
                <h5 className="fw-semibold mb-2">No Doctors Found</h5>
                <p className="text-secondary small">No doctors match your search criteria. Try adjusting the filters.</p>
              </div>
            ) : (
              <Row className="g-3">
                {filteredDoctors.map((doc) => (
                  <Col md={selectedDoctor ? 12 : 6} lg={selectedDoctor ? 12 : 4} key={doc.uid}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      className={`glass-panel p-4 h-100 cursor-pointer ${selectedDoctor?.uid === doc.uid ? 'selected-doctor-card' : ''}`}
                      onClick={() => setSelectedDoctor(doc)}
                      style={{ 
                        cursor: 'pointer',
                        border: selectedDoctor?.uid === doc.uid ? '2px solid #2e86c1' : undefined,
                      }}
                    >
                      <div className="d-flex align-items-start gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '48px', height: '48px', flexShrink: 0,
                            background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                          }}>
                          <Stethoscope size={22} color="white" />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{doc.name}</h6>
                          <Badge bg="info" className="rounded-pill mb-2" style={{ fontSize: '0.7rem' }}>
                            {doc.specialization}
                          </Badge>
                          <div className="d-flex flex-column gap-1">
                            <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                              <Award size={11} /> {doc.qualification}
                            </span>
                            <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                              <Briefcase size={11} /> {doc.experience} yrs experience
                            </span>
                            {doc.phone && (
                              <span className="text-secondary d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                <Phone size={11} /> {doc.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            )}
          </Col>

          {/* Booking Panel */}
          <AnimatePresence>
            {selectedDoctor && (
              <Col lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="glass-panel p-4 position-sticky"
                  style={{ top: '100px' }}
                >
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <h5 className="fw-bold d-flex align-items-center gap-2 mb-0" style={{ color: '#2e86c1' }}>
                      <Calendar size={20} /> Book Appointment
                    </h5>
                    <button
                      className="btn btn-sm border-0 text-secondary"
                      onClick={() => setSelectedDoctor(null)}
                      style={{ fontSize: '1.2rem', lineHeight: 1 }}
                    >×</button>
                  </div>

                  {/* Selected Doctor Info */}
                  <div className="glass-panel p-3 mb-4" style={{ background: 'rgba(26, 82, 118, 0.05)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #1a5276, #2e86c1)', flexShrink: 0 }}>
                        <Stethoscope size={20} color="white" />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{selectedDoctor.name}</h6>
                        <span className="text-secondary small">{selectedDoctor.specialization} · {selectedDoctor.qualification}</span>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Timings */}
                  <div className="mb-4">
                    <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
                      <Clock size={14} style={{ color: '#2e86c1' }} /> Available Timings
                    </h6>
                    <div className="d-flex flex-wrap gap-1">
                      {selectedDoctor.clinicTimings && Object.entries(selectedDoctor.clinicTimings)
                        .filter(([_, t]) => t.active)
                        .map(([day, timing]) => (
                          <span key={day} className="badge rounded-pill px-2 py-1" 
                            style={{ background: 'rgba(26, 82, 118, 0.1)', color: '#2e86c1', fontSize: '0.7rem' }}>
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}: {timing.start}-{timing.end}
                          </span>
                        ))
                      }
                    </div>
                  </div>

                  {/* Booking Form */}
                  <Form onSubmit={handleManualBook}>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-secondary small fw-semibold">Appointment Date</Form.Label>
                      <input
                        type="date"
                        className="input-glass"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={minDate}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-secondary small fw-semibold">Preferred Time</Form.Label>
                      <input
                        type="time"
                        className="input-glass"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="text-secondary small fw-semibold">Note (Optional)</Form.Label>
                      <textarea
                        className="input-glass"
                        rows="2"
                        placeholder="Any additional information for the doctor..."
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                      />
                    </Form.Group>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-100 py-3 d-flex justify-content-center align-items-center gap-2 border-0 rounded-3 fw-semibold"
                      type="submit"
                      disabled={isBooking}
                      style={{
                        background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(26, 82, 118, 0.3)',
                      }}
                    >
                      {isBooking ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <>
                          <Calendar size={18} /> Confirm Booking
                        </>
                      )}
                    </motion.button>
                  </Form>
                </motion.div>
              </Col>
            )}
          </AnimatePresence>
        </Row>
      )}
    </Container>
  );
};

export default BookAppointment;
