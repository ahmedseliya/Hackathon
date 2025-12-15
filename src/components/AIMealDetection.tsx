// components/AIMealDetection.tsx
import React, { useState, useRef } from 'react';
import { Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Webcam from 'react-webcam';
import { 
  Camera, 
  Mic, 
  Upload, 
  X, 
  CheckCircle,
  Type,
  Sparkles
} from 'lucide-react';
import geminiService from '../services/geminiService';

interface AIResultData {
  foodItems: string[];
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: string;
  mealType: string;
}

interface AIMealDetectionProps {
  onMealDetected: (data: AIResultData) => void;
}

type TabType = 'camera' | 'upload' | 'voice' | 'text';

const AIMealDetection: React.FC<AIMealDetectionProps> = ({ onMealDetected }) => {
  const [activeTab, setActiveTab] = useState<TabType>('camera');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [voiceText, setVoiceText] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  
  // Camera states
  const [webcamImage, setWebcamImage] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  
  // Dropzone for file upload
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {'image/*': ['.jpeg', '.jpg', '.png']},
    onDrop: (files: File[]) => handleImageUpload(files[0])
  });

  // Handle image capture from webcam
  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setWebcamImage(imageSrc);
    }
  };

  // Process image with Gemini
  const processImage = async (imageData: string) => {
    setLoading(true);
    setError('');
    
    try {
      // Convert base64 to file
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'food-image.jpg', { type: 'image/jpeg' });
      
      // Call Gemini API
      const result = await geminiService.analyzeFoodImage(file);
      
      // Pass result to parent
      onMealDetected(result);
      setShowModal(false);
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Process voice/text input
  const processTextInput = async () => {
    const text = activeTab === 'voice' ? voiceText : manualText;
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await geminiService.processFoodDescription(text);
      
      // Pass result to parent
      onMealDetected(result);
      setShowModal(false);
      setVoiceText('');
      setManualText('');
      
    } catch (err: any) {
      setError(err.message || 'Failed to analyze description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        processImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Voice recording
  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceText(transcript);
      };
      
      recognition.onerror = (event: any) => {
        setError('Voice recognition failed. Please type instead.');
      };
      
      recognition.start();
    } else {
      setError('Voice recognition not supported. Please use Chrome or Edge.');
    }
  };

  // Define tabs array
  const tabs: {id: TabType, icon: React.ElementType, label: string}[] = [
    {id: 'camera', icon: Camera, label: 'Camera'},
    {id: 'upload', icon: Upload, label: 'Upload'},
    {id: 'voice', icon: Mic, label: 'Voice'},
    {id: 'text', icon: Type, label: 'Text'}
  ];

  return (
    <>
      {/* AI Detection Button */}
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          variant="success" 
          size="sm" 
          onClick={() => setShowModal(true)}
          className="btn-modern d-flex align-items-center gap-2"
        >
          <Sparkles size={16} />
          AI Detect Meal
        </Button>
      </motion.div>

      {/* AI Detection Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        centered
        size="lg"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-gradient">
            🤖 AI Meal Detection
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {/* Tabs */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "primary" : "outline-secondary"}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setError('');
                    setWebcamImage(null);
                  }}
                  className="btn-modern d-flex align-items-center gap-1"
                  size="sm"
                >
                  <Icon size={16} />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">
                AI is analyzing your meal...
                <br />
                <small>This may take a few seconds</small>
              </p>
            </div>
          )}

          {/* Camera Tab */}
          {activeTab === 'camera' && !loading && (
            <div className="text-center">
              <div className="border rounded p-2 mb-3 position-relative" style={{ height: '300px', backgroundColor: '#f8f9fa' }}>
                {webcamImage ? (
                  <img 
                    src={webcamImage} 
                    alt="Captured" 
                    className="h-100 w-100 object-fit-cover rounded"
                  />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="h-100 w-100 object-fit-cover rounded"
                    videoConstraints={{
                      facingMode: 'environment'
                    }}
                  />
                )}
              </div>
              
              <div className="d-flex gap-2 justify-content-center">
                {webcamImage ? (
                  <>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="success" 
                        onClick={() => processImage(webcamImage)}
                        className="btn-modern d-flex align-items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Analyze with AI
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setWebcamImage(null)}
                        className="btn-modern d-flex align-items-center gap-2"
                      >
                        <X size={16} />
                        Retake Photo
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="primary" 
                      onClick={captureImage}
                      className="btn-modern d-flex align-items-center gap-2"
                    >
                      <Camera size={16} />
                      Capture Photo
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && !loading && (
            <div 
              {...getRootProps()} 
              className={`p-5 text-center border-2 rounded ${isDragActive ? 'border-primary' : 'border-dashed border-secondary'}`}
              style={{ 
                cursor: 'pointer',
                backgroundColor: isDragActive ? '#e7f1ff' : '#f8f9fa',
                transition: 'all 0.3s ease'
              }}
            >
              <input {...getInputProps()} />
              <Upload size={48} className="mb-3 text-primary" />
              <h5>Drag & Drop food image here</h5>
              <p className="text-muted">or click to select from your device</p>
              <p className="text-muted small mb-0">Supports JPG, PNG (Max 5MB)</p>
            </div>
          )}

          {/* Voice Tab */}
          {activeTab === 'voice' && !loading && (
            <div className="text-center p-4">
              <div className="position-relative d-inline-block mb-4">
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div className="spinner-grow text-primary" style={{ width: '80px', height: '80px', opacity: 0.1 }}></div>
                </div>
                <Mic size={64} className="text-primary position-relative" />
              </div>
              
              <h5>Describe your meal verbally</h5>
              <p className="text-muted mb-4">Example: "I ate scrambled eggs with two slices of toast"</p>
              
              <div className="mb-4">
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Your voice input will appear here..."
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  className="form-modern-control"
                  style={{ minHeight: '80px' }}
                />
              </div>
              
              <div className="d-flex gap-3 justify-content-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    onClick={startVoiceInput}
                    className="btn-modern d-flex align-items-center gap-2 px-4"
                  >
                    <Mic size={16} />
                    Start Speaking
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="success" 
                    onClick={processTextInput}
                    disabled={!voiceText.trim()}
                    className="btn-modern d-flex align-items-center gap-2 px-4"
                  >
                    <Sparkles size={16} />
                    Analyze Now
                  </Button>
                </motion.div>
              </div>
            </div>
          )}

          {/* Text Tab */}
          {activeTab === 'text' && !loading && (
            <div>
              <Form.Group>
                <Form.Label className="fw-semibold">Describe your meal</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Example: Grilled chicken breast with brown rice and steamed vegetables"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="form-modern-control mb-4"
                />
              </Form.Group>
              
              <div className="text-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="primary" 
                    onClick={processTextInput}
                    disabled={!manualText.trim()}
                    className="btn-modern d-flex align-items-center gap-2 mx-auto px-5"
                    size="lg"
                  >
                    <Sparkles size={18} />
                    Analyze with AI
                  </Button>
                </motion.div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AIMealDetection;