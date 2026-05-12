import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginWithEmail, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate, loading]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <span className="spinner-border" style={{ color: '#2e86c1' }} />
      </div>
    );
  }


  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setFormLoading(true);
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in with email and password.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Container className="py-5 mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-5"
          >
            <div className="text-center mb-5">
              <div className="bg-primary bg-opacity-25 p-3 rounded-circle d-inline-block mb-3">
                <LogIn size={32} className="text-primary" />
              </div>
              <h2 className="fw-bold mb-2">Welcome Back</h2>
              <p className="text-secondary">Sign in to access your health dashboard</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleEmailLogin}>
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-semibold text-uppercase">Email Address</Form.Label>
                <input 
                  type="email" 
                  className="input-glass" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="text-secondary small fw-semibold text-uppercase mb-0">Password</Form.Label>
                  <a href="#" className="text-primary small text-decoration-none">Forgot password?</a>
                </div>
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
                className="btn-primary-glass w-100 py-3 mb-3 d-flex justify-content-center align-items-center gap-2"
                type="submit"
                disabled={formLoading}
              >
                Sign In
              </motion.button>

              <p className="text-center text-secondary small mb-0">
                Don't have an account? <Link to="/register" className="text-primary text-decoration-none fw-semibold">Create one</Link>
              </p>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
