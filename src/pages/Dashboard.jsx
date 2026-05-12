import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Clock, Activity, FileText, AlertTriangle, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { generatePDFReport } from '../utils/reportGenerator';

const Dashboard = () => {
  const { currentUser, patientProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'diagnosis_history'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  const latestRisk = history.length > 0 ? history[0].riskLevel : 'None';

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold mb-1">Patient Dashboard</h2>
          <p className="text-secondary mb-0">Welcome back, {patientProfile?.name || currentUser?.displayName || 'User'}! Here's your health overview.</p>
        </div>
        <Link to="/symptom-checker" className="btn-primary-glass text-decoration-none d-flex align-items-center gap-2">
          <Activity size={18} />
          <span>New Assessment</span>
        </Link>
      </div>

      <Row className="mb-5">
        <Col md={4} className="mb-4 mb-md-0">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-primary bg-opacity-25 p-2 rounded">
                <Clock size={20} className="text-primary" />
              </div>
              <h5 className="mb-0 fw-semibold">Recent Activity</h5>
            </div>
            <h2 className="display-4 fw-bold mb-0">{loading ? '-' : history.length}</h2>
            <p className="text-secondary small mt-2">Assessments total</p>
          </motion.div>
        </Col>
        <Col md={4} className="mb-4 mb-md-0">
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className={`bg-${latestRisk.includes('High') ? 'danger' : latestRisk.includes('Medium') ? 'warning' : 'success'} bg-opacity-25 p-2 rounded`}>
                <AlertTriangle size={20} className={`text-${latestRisk.includes('High') ? 'danger' : latestRisk.includes('Medium') ? 'warning' : 'success'}`} />
              </div>
              <h5 className="mb-0 fw-semibold">Current Risk Level</h5>
            </div>
            <h2 className={`display-4 fw-bold text-${latestRisk.includes('High') ? 'danger' : latestRisk.includes('Medium') ? 'warning' : 'success'} mb-0`}>
              {loading ? '-' : latestRisk}
            </h2>
            <p className="text-secondary small mt-2">Based on your last assessment</p>
          </motion.div>
        </Col>
        <Col md={4}>
          <motion.div whileHover={{ y: -5 }} className="glass-panel p-4 h-100">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="bg-warning bg-opacity-25 p-2 rounded">
                <FileText size={20} className="text-warning" />
              </div>
              <h5 className="mb-0 fw-semibold">Saved Reports</h5>
            </div>
            <h2 className="display-4 fw-bold mb-0">{loading ? '-' : history.length}</h2>
            <p className="text-secondary small mt-2">Available for download</p>
          </motion.div>
        </Col>
      </Row>

      <h4 className="fw-bold mb-4">Diagnosis History</h4>
      <div className="glass-panel p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover mb-0" style={{ color: 'var(--text-primary)', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'rgba(255, 255, 255, 0.03)' }}>
              <tr>
                <th className="py-4 px-4 border-0 fw-bold">Date</th>
                <th className="py-4 border-0 fw-bold">Symptoms</th>
                <th className="py-4 border-0 fw-bold">Prediction</th>
                <th className="py-4 border-0 fw-bold">Risk</th>
                <th className="py-4 px-4 border-0 fw-bold text-end">Actions</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: 'none' }}>
              {loading && <tr><td colSpan="5" className="text-center py-5 text-secondary">Loading history...</td></tr>}
              {!loading && history.length === 0 && (
                <tr><td colSpan="5" className="text-center py-5 text-secondary">No history found. Start a new assessment!</td></tr>
              )}
              {!loading && history.map((record) => (
                <tr key={record.id} className="hover-glass-row transition-all">
                  <td className="py-4 px-4 align-middle">
                    {new Date(record.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-4 align-middle">
                    <div className="text-truncate" style={{ maxWidth: '250px' }}>{record.symptoms}</div>
                  </td>
                  <td className="py-4 align-middle fw-medium">
                    {record.predictions && record.predictions.length > 0 ? record.predictions[0].disease : 'N/A'}
                  </td>
                  <td className="py-4 align-middle">
                    <span className={`badge bg-${record.riskLevel.toLowerCase().includes('high') || record.riskLevel.toLowerCase().includes('emergency') ? 'danger' : record.riskLevel.toLowerCase().includes('medium') ? 'warning' : 'success'} px-3 py-2 rounded-pill`} style={{ fontSize: '0.75rem' }}>
                      {record.riskLevel}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-end align-middle">
                    <div className="d-flex gap-2 justify-content-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary-glass btn-sm text-decoration-none d-flex align-items-center gap-2"
                        onClick={() => navigate('/book-appointment', {
                          state: {
                            diagnosisData: {
                              topPredictions: record.predictions,
                              riskLevel: record.riskLevel,
                              reasoning: record.reasoning || '',
                              recommendation: record.recommendation || '',
                              symptoms: record.symptoms,
                            },
                            autoBook: false
                          }
                        })}
                      >
                        <Calendar size={13} />
                        <span>Book</span>
                      </motion.button>
                      <button 
                        className="btn-secondary-glass btn-sm px-3"
                        style={{ fontSize: '0.85rem' }}
                        onClick={() => generatePDFReport(record)}
                      >
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
