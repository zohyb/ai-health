import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Users, CheckCircle, XCircle, AlertTriangle,
  Stethoscope, Activity, Phone, Award, Briefcase, LogOut, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from '../context/DoctorContext';

const DoctorDashboard = () => {
  const { doctorProfile, doctorUser, logoutDoctor, getDoctorAppointments, updateAppointmentStatus } = useDoctor();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorUser) return;
      try {
        const data = await getDoctorAppointments(doctorUser.uid);
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorUser]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      await updateAppointmentStatus(appointmentId, newStatus);
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt)
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutDoctor();
      navigate('/doctor/login');
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(apt => apt.status === filter);

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    today: appointments.filter(a => {
      const today = new Date().toDateString();
      return new Date(a.appointmentDate).toDateString() === today;
    }).length,
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getRiskBadgeClass = (risk) => {
    if (!risk) return 'secondary';
    const r = risk.toLowerCase();
    if (r.includes('high') || r.includes('emergency')) return 'danger';
    if (r.includes('medium')) return 'warning';
    return 'success';
  };

  if (!doctorProfile) {
    return (
      <Container className="py-5 text-center">
        <div className="glass-panel p-5">
          <Stethoscope size={48} className="text-secondary mb-3" />
          <h4 className="fw-bold mb-2">Doctor Profile Not Found</h4>
          <p className="text-secondary mb-4">Please login with your doctor credentials.</p>
          <button className="doctor-btn-primary" onClick={() => navigate('/doctor/login')}>
            Go to Doctor Login
          </button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-5 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="d-flex align-items-center justify-content-center rounded-circle"
              style={{ 
                width: '55px', height: '55px',
                background: 'linear-gradient(135deg, #1a5276, #2e86c1)',
                boxShadow: '0 6px 20px rgba(26, 82, 118, 0.3)'
              }}
            >
              <Stethoscope size={28} color="white" />
            </div>
            <div>
              <h2 className="fw-bold mb-0">{doctorProfile.name}</h2>
              <div className="d-flex align-items-center gap-2 mt-1">
                <Badge bg="info" className="rounded-pill px-3">{doctorProfile.specialization}</Badge>
                <span className="text-secondary small">{doctorProfile.qualification}</span>
              </div>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="btn-secondary-glass d-flex align-items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </motion.button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-5">
        <Col xs={6} md={3} className="mb-3">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100 text-center">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="p-2 rounded" style={{ background: 'rgba(26, 82, 118, 0.15)' }}>
                <Calendar size={22} style={{ color: '#2e86c1' }} />
              </div>
            </div>
            <h2 className="display-5 fw-bold mb-0" style={{ color: '#2e86c1' }}>{stats.today}</h2>
            <p className="text-secondary small mt-1 mb-0">Today's Appointments</p>
          </motion.div>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100 text-center">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="p-2 rounded bg-warning bg-opacity-25">
                <Clock size={22} className="text-warning" />
              </div>
            </div>
            <h2 className="display-5 fw-bold text-warning mb-0">{stats.pending}</h2>
            <p className="text-secondary small mt-1 mb-0">Pending</p>
          </motion.div>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100 text-center">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="p-2 rounded bg-success bg-opacity-25">
                <CheckCircle size={22} className="text-success" />
              </div>
            </div>
            <h2 className="display-5 fw-bold text-success mb-0">{stats.confirmed}</h2>
            <p className="text-secondary small mt-1 mb-0">Confirmed</p>
          </motion.div>
        </Col>
        <Col xs={6} md={3} className="mb-3">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100 text-center">
            <div className="d-flex align-items-center justify-content-center mb-3">
              <div className="p-2 rounded" style={{ background: 'rgba(26, 82, 118, 0.15)' }}>
                <Users size={22} style={{ color: '#2e86c1' }} />
              </div>
            </div>
            <h2 className="display-5 fw-bold mb-0" style={{ color: '#1a5276' }}>{stats.total}</h2>
            <p className="text-secondary small mt-1 mb-0">Total Patients</p>
          </motion.div>
        </Col>
      </Row>

      {/* Doctor Info Panel */}
      <Row className="mb-5">
        <Col md={4} className="mb-4 mb-md-0">
          <div className="glass-panel p-4 h-100">
            <h5 className="fw-semibold mb-4 d-flex align-items-center gap-2" style={{ color: '#2e86c1' }}>
              <Award size={18} /> Profile Details
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex align-items-center gap-3">
                <Briefcase size={16} className="text-secondary" />
                <div>
                  <span className="text-secondary small">Experience</span>
                  <p className="mb-0 fw-medium">{doctorProfile.experience} years</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Phone size={16} className="text-secondary" />
                <div>
                  <span className="text-secondary small">Phone</span>
                  <p className="mb-0 fw-medium">{doctorProfile.phone}</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <Activity size={16} className="text-secondary" />
                <div>
                  <span className="text-secondary small">Status</span>
                  <p className="mb-0 fw-medium">
                    <span className="d-inline-block rounded-circle me-1" style={{ width: '8px', height: '8px', background: '#10b981' }}></span>
                    Available
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ borderColor: 'var(--glass-border)' }} />

            <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
              <Clock size={16} style={{ color: '#2e86c1' }} /> Clinic Timings
            </h6>
            <div className="d-flex flex-column gap-1">
              {doctorProfile.clinicTimings && Object.entries(doctorProfile.clinicTimings).map(([day, timing]) => (
                <div key={day} className="d-flex justify-content-between align-items-center py-1">
                  <span className="text-capitalize small fw-medium" style={{ opacity: timing.active ? 1 : 0.4 }}>
                    {day}
                  </span>
                  <span className="small" style={{ opacity: timing.active ? 0.8 : 0.4 }}>
                    {timing.active ? `${timing.start} - ${timing.end}` : 'Closed'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Appointments Table */}
        <Col md={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0 d-flex align-items-center gap-2">
              <Calendar size={20} /> Appointments
            </h4>
            <div className="d-flex align-items-center gap-2">
              <Filter size={14} className="text-secondary" />
              <select 
                className="input-glass py-1 px-3"
                style={{ width: 'auto', fontSize: '0.85rem' }}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All ({stats.total})</option>
                <option value="pending">Pending ({stats.pending})</option>
                <option value="confirmed">Confirmed ({stats.confirmed})</option>
                <option value="completed">Completed ({stats.completed})</option>
              </select>
            </div>
          </div>

          <div className="glass-panel p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover mb-0" style={{ color: 'var(--text-primary)', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(26, 82, 118, 0.05)' }}>
                  <tr>
                    <th className="py-3 px-4 border-0 fw-bold small">Patient</th>
                    <th className="py-3 border-0 fw-bold small">Date & Time</th>
                    <th className="py-3 border-0 fw-bold small">Condition</th>
                    <th className="py-3 border-0 fw-bold small">Risk</th>
                    <th className="py-3 border-0 fw-bold small">Status</th>
                    <th className="py-3 px-4 border-0 fw-bold small text-end">Actions</th>
                  </tr>
                </thead>
                <tbody style={{ borderTop: 'none' }}>
                  {loading && (
                    <tr><td colSpan="6" className="text-center py-5 text-secondary">
                      <span className="spinner-border spinner-border-sm me-2" />Loading appointments...
                    </td></tr>
                  )}
                  {!loading && filteredAppointments.length === 0 && (
                    <tr><td colSpan="6" className="text-center py-5 text-secondary">
                      <Calendar size={32} className="mb-2 d-block mx-auto opacity-50" />
                      No appointments found.
                    </td></tr>
                  )}
                  <AnimatePresence>
                    {!loading && filteredAppointments.map((apt) => (
                      <motion.tr 
                        key={apt.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover-glass-row"
                      >
                        <td className="py-3 px-4 align-middle">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded-circle d-flex align-items-center justify-content-center"
                              style={{ width: '32px', height: '32px', background: 'rgba(26, 82, 118, 0.15)', flexShrink: 0 }}>
                              <Users size={14} style={{ color: '#2e86c1' }} />
                            </div>
                            <div>
                              <span className="fw-medium small">{apt.patientName || 'Anonymous'}</span>
                              <br />
                              <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{apt.patientEmail || ''}</span>
                              {apt.patientPhone && (
                                <>
                                  <br />
                                  <span className="text-secondary d-inline-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                                    <Phone size={10} /> {apt.patientPhone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 align-middle">
                          <span className="small fw-medium">
                            {new Date(apt.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <br />
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            {apt.appointmentTime || 'Not specified'}
                          </span>
                        </td>
                        <td className="py-3 align-middle">
                          <span className="small" style={{ maxWidth: '180px', display: 'block' }}>
                            {apt.condition || apt.symptoms || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 align-middle">
                          <Badge bg={getRiskBadgeClass(apt.riskLevel)} className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            {apt.riskLevel || 'N/A'}
                          </Badge>
                        </td>
                        <td className="py-3 align-middle">
                          <Badge bg={getStatusBadgeClass(apt.status)} className="rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>
                            {apt.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-end align-middle">
                          {apt.status === 'pending' && (
                            <div className="d-flex gap-1 justify-content-end">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="btn btn-sm border-0 p-1"
                                onClick={() => handleStatusUpdate(apt.id, 'confirmed')}
                                disabled={updatingId === apt.id}
                                title="Confirm"
                                style={{ color: '#10b981' }}
                              >
                                <CheckCircle size={18} />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="btn btn-sm border-0 p-1"
                                onClick={() => handleStatusUpdate(apt.id, 'cancelled')}
                                disabled={updatingId === apt.id}
                                title="Cancel"
                                style={{ color: '#ef4444' }}
                              >
                                <XCircle size={18} />
                              </motion.button>
                            </div>
                          )}
                          {apt.status === 'confirmed' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm border-0 rounded-pill px-3 py-1"
                              onClick={() => handleStatusUpdate(apt.id, 'completed')}
                              disabled={updatingId === apt.id}
                              style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '0.75rem' }}
                            >
                              Mark Done
                            </motion.button>
                          )}
                          {(apt.status === 'completed' || apt.status === 'cancelled') && (
                            <span className="text-secondary small fst-italic">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DoctorDashboard;
