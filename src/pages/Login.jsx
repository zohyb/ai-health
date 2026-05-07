import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { LogIn, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in with Google. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to log in with email and password.');
    } finally {
      setLoading(false);
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
                disabled={loading}
              >
                Sign In
              </motion.button>
              
              <div className="text-center my-4 text-secondary small position-relative">
                <span className="bg-dark px-2 position-relative z-1" style={{ background: 'var(--bg-color)' }}>OR CONTINUE WITH</span>
                <hr className="position-absolute top-50 start-0 w-100 m-0 z-0" style={{ borderColor: 'var(--glass-border)' }} />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                className="btn-secondary-glass w-100 py-3 mb-4 d-flex justify-content-center align-items-center gap-2"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <User size={20} />
                Sign in with Google
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
