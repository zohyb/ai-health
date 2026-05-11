import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, Search, AlertCircle, CheckCircle, X, Image as ImageIcon, Calendar, AlertTriangle, Stethoscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDoctor } from '../context/DoctorContext';
import { db } from '../services/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { analyzeSymptomsWithHistory, analyzeSymptomsWithImage } from '../services/groqService';
import { generatePDFReport } from '../utils/reportGenerator';
import { useNavigate } from 'react-router-dom';

const SymptomChecker = () => {
  const { currentUser } = useAuth();
  const { findDoctorForCondition } = useDoctor();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'diagnosis_history'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => doc.data());
        historyData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(historyData);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };
    fetchHistory();
  }, [currentUser]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 4MB for Groq)
    if (file.size > 4 * 1024 * 1024) {
      setError('Image must be smaller than 4MB.');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleImageSelect(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !selectedImage) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      let aiResponse;

      if (selectedImage && imagePreview) {
        // Use the vision model when an image is provided
        aiResponse = await analyzeSymptomsWithImage(symptoms, imagePreview, history);
      } else {
        // Text-only analysis
        aiResponse = await analyzeSymptomsWithHistory(symptoms, history);
      }
      
      const diagnosisRecord = {
        userId: currentUser.uid,
        symptoms: symptoms || '(Image-based analysis)',
        predictions: aiResponse.topPredictions,
        riskLevel: aiResponse.riskLevel,
        reasoning: aiResponse.reasoning,
        recommendation: aiResponse.recommendation,
        hasImage: !!selectedImage,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'diagnosis_history'), diagnosisRecord);
      
      setResult(aiResponse);
      setStep(2);
      setHistory(prev => [diagnosisRecord, ...prev]);

    } catch (err) {
      console.error(err);
      setError('An error occurred while analyzing. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSymptoms('');
    setResult(null);
    removeImage();
  };

  const canAnalyze = symptoms.trim() || selectedImage;

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2">AI Symptom Checker</h2>
            <p className="text-secondary">Describe your symptoms naturally and optionally upload an image.</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass-panel p-4 p-md-5"
              >
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold mb-3 d-flex align-items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    How are you feeling today?
                  </Form.Label>
                  <textarea 
                    className="input-glass" 
                    rows="4" 
                    placeholder="E.g., I have had a severe headache since yesterday, along with a slight fever and stiff neck..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  ></textarea>
                </Form.Group>

                <Form.Group className="mb-5">
                  <Form.Label className="fw-semibold mb-3 d-flex align-items-center gap-2">
                    <Upload size={18} className="text-primary" />
                    Upload Medical Image (Optional)
                  </Form.Label>

                  {!imagePreview ? (
                    <div 
                      className="border border-dashed rounded-3 p-5 text-center position-relative transition-all" 
                      style={{ borderColor: 'var(--glass-border)', background: 'rgba(128,0,0,0.03)', cursor: 'pointer' }}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={32} className="text-secondary mb-3 mx-auto" />
                      <p className="text-secondary mb-1">Drag and drop an image here</p>
                      <p className="text-secondary small mb-3">or</p>
                      <span className="btn btn-sm btn-outline-light rounded-pill px-4">Browse Files</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="d-none"
                        onChange={handleImageSelect}
                      />
                      <p className="text-secondary small mt-3 mb-0">Supports: JPEG, PNG, WebP (Max 4MB)</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-panel p-3 position-relative"
                    >
                      <button 
                        onClick={removeImage}
                        className="btn btn-danger btn-sm rounded-circle position-absolute d-flex align-items-center justify-content-center"
                        style={{ top: '-10px', right: '-10px', width: '30px', height: '30px', zIndex: 2 }}
                      >
                        <X size={14} />
                      </button>
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview"
                          className="rounded-3"
                          style={{ width: '120px', height: '120px', objectFit: 'cover', border: '2px solid var(--glass-border)' }}
                        />
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <ImageIcon size={16} className="text-success" />
                            <span className="fw-semibold text-success">Image Ready</span>
                          </div>
                          <p className="text-secondary small mb-1">{selectedImage.name}</p>
                          <p className="text-secondary small mb-0">{(selectedImage.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Form.Text className="text-muted mt-2 d-block small">
                    Supported conditions: Skin rashes, acne, swelling, redness, allergies, wounds, etc.
                  </Form.Text>
                </Form.Group>

                <div className="text-end">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary-glass px-5 py-3 d-inline-flex align-items-center gap-2"
                    onClick={handleAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {selectedImage ? 'Analyzing Image & Symptoms...' : 'Analyzing Context & History...'}
                      </>
                    ) : (
                      <>
                        <Search size={18} />
                        {selectedImage ? 'Analyze with Image' : 'Analyze Symptoms'}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="d-flex flex-column gap-4"
              >
                {result && (
                  <div className="glass-panel p-4 d-flex align-items-start gap-4">
                    <div className={`bg-${result.riskLevel.includes('High') || result.riskLevel.includes('Emergency') ? 'danger' : result.riskLevel.includes('Medium') ? 'warning' : 'success'} bg-opacity-25 p-3 rounded-circle shrink-0`}>
                      <CheckCircle size={32} className={`text-${result.riskLevel.includes('High') || result.riskLevel.includes('Emergency') ? 'danger' : result.riskLevel.includes('Medium') ? 'warning' : 'success'}`} />
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h4 className="fw-bold mb-0">Analysis Complete</h4>
                        <span className={`badge bg-${result.riskLevel.includes('High') || result.riskLevel.includes('Emergency') ? 'danger' : result.riskLevel.includes('Medium') ? 'warning' : 'success'}`}>
                          {result.riskLevel}
                        </span>
                      </div>
                      <p className="text-secondary mb-4">Based on the symptoms provided{selectedImage ? ', uploaded image,' : ''} and your medical history, our AI has generated the following preliminary assessment.</p>
                      
                      <h5 className="fw-semibold mb-3">Top Predictions</h5>
                      <div className="d-flex flex-column gap-3 mb-4">
                        {result.topPredictions?.map((pred, idx) => (
                          <div key={idx}>
                            <div className="d-flex justify-content-between mb-1">
                              <span>{pred.disease}</span>
                              <span className="text-primary fw-bold">{pred.confidence}%</span>
                            </div>
                            <div className="progress rounded-pill" style={{ height: '8px', background: 'rgba(128,0,0,0.1)' }}>
                              <div className="progress-bar rounded-pill" style={{ width: `${pred.confidence}%`, background: 'var(--accent-secondary)' }}></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="glass-panel p-3 mb-4" style={{ background: 'rgba(128,0,0,0.05)' }}>
                        <h6 className="fw-semibold d-flex align-items-center gap-2 mb-2">
                          <AlertCircle size={16} className="text-warning" />
                          AI Reasoning (Contextualized)
                        </h6>
                        <p className="text-secondary small mb-0">
                          {result.reasoning}
                        </p>
                      </div>

                      <div className="glass-panel p-3 mb-4" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                        <h6 className="fw-semibold text-success mb-2">Recommendation</h6>
                        <p className="text-secondary small mb-0">
                          {result.recommendation}
                        </p>
                      </div>

                      {/* Auto-Book Alert for High Risk */}
                      {(result.riskLevel?.toLowerCase().includes('high') || result.riskLevel?.toLowerCase().includes('emergency')) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="glass-panel p-4 mb-4"
                          style={{ 
                            background: result.riskLevel?.toLowerCase().includes('emergency') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                            border: `2px solid ${result.riskLevel?.toLowerCase().includes('emergency') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <AlertTriangle size={24} className={`text-${result.riskLevel?.toLowerCase().includes('emergency') ? 'danger' : 'warning'}`} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <h6 className="fw-bold mb-1">
                                {result.riskLevel?.toLowerCase().includes('emergency') 
                                  ? '🚨 Emergency — Immediate Medical Attention Required'
                                  : '⚠️ High Risk — Doctor Consultation Recommended'}
                              </h6>
                              <p className="text-secondary small mb-3">
                                Based on your diagnosis, we strongly recommend seeing a specialist immediately. 
                                Click below to auto-book an appointment with an available specialist.
                              </p>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="d-flex align-items-center gap-2 border-0 rounded-3 px-4 py-2 fw-semibold"
                                style={{
                                  background: result.riskLevel?.toLowerCase().includes('emergency') 
                                    ? 'linear-gradient(135deg, #dc2626, #ef4444)' 
                                    : 'linear-gradient(135deg, #1a5276, #2e86c1)',
                                  color: 'white',
                                  boxShadow: '0 4px 15px rgba(26, 82, 118, 0.3)',
                                }}
                                onClick={() => navigate('/book-appointment', { 
                                  state: { 
                                    diagnosisData: {
                                      topPredictions: result.topPredictions,
                                      riskLevel: result.riskLevel,
                                      reasoning: result.reasoning,
                                      recommendation: result.recommendation,
                                      symptoms: symptoms || '(Image-based analysis)',
                                    },
                                    autoBook: true
                                  }
                                })}
                              >
                                <Stethoscope size={16} />
                                Auto-Book Specialist Appointment
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="d-flex gap-3 flex-wrap">
                        <button className="btn-primary-glass" onClick={resetForm}>New Assessment</button>
                        <button 
                          className="btn-secondary-glass"
                          onClick={() => generatePDFReport({
                            symptoms: symptoms || '(Image-based analysis)',
                            predictions: result.topPredictions,
                            riskLevel: result.riskLevel,
                            reasoning: result.reasoning,
                            recommendation: result.recommendation,
                            timestamp: new Date().toISOString()
                          })}
                        >
                          Save Report (PDF)
                        </button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="btn-secondary-glass d-flex align-items-center gap-2"
                          onClick={() => navigate('/book-appointment', { 
                            state: { 
                              diagnosisData: {
                                topPredictions: result.topPredictions,
                                riskLevel: result.riskLevel,
                                reasoning: result.reasoning,
                                recommendation: result.recommendation,
                                symptoms: symptoms || '(Image-based analysis)',
                              },
                              autoBook: false
                            }
                          })}
                        >
                          <Calendar size={16} />
                          Book Appointment
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-5">
            <p className="text-secondary small" style={{ opacity: 0.7 }}>
              <strong>Disclaimer:</strong> This tool is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SymptomChecker;
