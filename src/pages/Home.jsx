import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap, ArrowRight, Upload, BrainCircuit } from 'lucide-react';

const Home = () => {
  return (
    <Container className="py-5">
      <Row className="align-items-center min-vh-75 mt-5">
        <Col lg={6} className="mb-5 mb-lg-0">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill glass-panel mb-4">
              <span className="badge bg-primary text-white rounded-pill">New</span>
              <span className="text-secondary small">Llama 3.3 70B Integration Active</span>
            </div>
            
            <h1 className="display-3 fw-bold mb-4" style={{ lineHeight: 1.2 }}>
              Intelligent Healthcare <br />
              <span className="gradient-text glow-effect">At Your Fingertips</span>
            </h1>
            
            <p className="lead text-secondary mb-5" style={{ fontSize: '1.2rem', maxWidth: '90%' }}>
              Experience the future of preliminary medical diagnosis. Our multimodal AI analyzes your symptoms and medical images to provide rapid, explainable health insights.
            </p>
            
            <div className="d-flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="btn-primary-glass text-decoration-none d-flex align-items-center gap-2 py-3 px-4" style={{ fontSize: '1.1rem' }}>
                  <Activity size={20} />
                  Patient Login
                  <ArrowRight size={18} />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-secondary-glass text-decoration-none d-flex align-items-center gap-2 py-3 px-4" style={{ fontSize: '1.1rem' }}>
                  <UserPlus size={20} />
                  Create Profile
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </Col>
        
        <Col lg={6}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="position-relative"
          >
            <div className="glass-panel p-4" style={{ background: 'rgba(30, 41, 59, 0.4)' }}>
              <div className="d-flex flex-column gap-4">
                {/* Feature 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glass-panel p-4 d-flex align-items-start gap-3"
                >
                  <div className="bg-primary bg-opacity-25 p-3 rounded-circle">
                    <BrainCircuit size={24} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="fw-semibold mb-2">Multimodal AI Analysis</h4>
                    <p className="text-secondary mb-0 small">Combines text symptom extraction with advanced image recognition for holistic diagnostics.</p>
                  </div>
                </motion.div>
                
                {/* Feature 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-panel p-4 d-flex align-items-start gap-3"
                >
                  <div className="bg-success bg-opacity-25 p-3 rounded-circle">
                    <Zap size={24} className="text-success" />
                  </div>
                  <div>
                    <h4 className="fw-semibold mb-2">Real-time Risk Assessment</h4>
                    <p className="text-secondary mb-0 small">Instantly categorizes condition severity with explainable AI reasoning.</p>
                  </div>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glass-panel p-4 d-flex align-items-start gap-3"
                >
                  <div className="bg-warning bg-opacity-25 p-3 rounded-circle">
                    <ShieldCheck size={24} className="text-warning" />
                  </div>
                  <div>
                    <h4 className="fw-semibold mb-2">Private & Secure</h4>
                    <p className="text-secondary mb-0 small">Your medical data is protected with enterprise-grade security and authentication.</p>
                  </div>
                </motion.div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="position-absolute top-0 start-100 translate-middle rounded-circle bg-primary opacity-25 blur-3xl" style={{ width: '200px', height: '200px', filter: 'blur(50px)', zIndex: -1 }}></div>
            <div className="position-absolute bottom-0 start-0 translate-middle rounded-circle bg-secondary opacity-25 blur-3xl" style={{ width: '150px', height: '150px', filter: 'blur(40px)', zIndex: -1 }}></div>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

// Just a quick icon patch
const UserPlus = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <line x1="19" y1="8" x2="19" y2="14"></line>
    <line x1="22" y1="11" x2="16" y2="11"></line>
  </svg>
);

export default Home;
