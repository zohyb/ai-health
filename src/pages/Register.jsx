import React, { useState } from 'react';
import { Container, Row, Col, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { signupWithEmail, currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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


  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setError('');
      setFormLoading(true);
      await signupWithEmail(email, password, { name, phone });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError('Failed to create account: ' + err.message);
      }
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
                <UserPlus size={32} className="text-primary" />
              </div>
              <h2 className="fw-bold mb-2">Create Account</h2>
              <p className="text-secondary">Join the AI Health Portal</p>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleEmailRegister}>
              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-semibold text-uppercase">Full Name</Form.Label>
                <input 
                  type="text" 
                  className="input-glass" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-semibold text-uppercase">Phone Number</Form.Label>
                <input 
                  type="tel" 
                  className="input-glass" 
                  placeholder="+1 234 567 8900" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </Form.Group>

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

              <Form.Group className="mb-4">
                <Form.Label className="text-secondary small fw-semibold text-uppercase">Password</Form.Label>
                <input 
                  type="password" 
                  className="input-glass" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-5">
                <Form.Label className="text-secondary small fw-semibold text-uppercase">Confirm Password</Form.Label>
                <input 
                  type="password" 
                  className="input-glass" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                Sign Up
              </motion.button>

              <p className="text-center text-secondary small mb-0">
                Already have an account? <Link to="/login" className="text-primary text-decoration-none fw-semibold">Sign in</Link>
              </p>
            </Form>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
