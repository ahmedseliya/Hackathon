import React, { useState, type ChangeEvent } from 'react';
import { Card, Table, Button, Badge, Row, Col, Modal, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { sampleExercises } from '../data/sampleData';
import GeminiService from '../services/geminiService';
import { 
  Plus, 
  Eye, 
  TrendingUp, 
  Target, 
  Activity, 
  Dumbbell, 
  Clock,
  Flame,
  Heart,
  Zap,
  Filter,
  Trash2,
  Bot,
  Download,
  MessageSquare,
  Brain,
  Sparkles
} from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  type: string;
  duration: string;
  calories: number;
  intensity?: string;
  heartRate?: number;
  date?: string;
}

interface AIExerciseRecommendation {
  recommendedExercises: Array<{
    name: string;
    type: string;
    duration: string;
    calories: number;
    intensity: string;
    description: string;
    benefits: string[];
  }>;
  workoutPlan: {
    weeklySchedule: {
      day: string;
      exercises: string[];
      focus: string;
    }[];
    restDays: string[];
    progression: string;
  };
  nutritionTips: string[];
  recoveryTips: string[];
  progressTimeline: string;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

type FormControlElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export default function ExerciseTracker() {
  const [exercises, setExercises] = useState<Exercise[]>(sampleExercises);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewAll, setShowViewAll] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<AIExerciseRecommendation | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your AI fitness assistant. I can see your exercise history and help you with personalized workout advice, nutrition tips, and answer any fitness questions you have!",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [userMessage, setUserMessage] = useState('');
  const [isChatbotTyping, setIsChatbotTyping] = useState(false);
  
  // New exercise form state
  const [newExercise, setNewExercise] = useState({
    name: '',
    type: 'Cardio',
    duration: '30',
    calories: 100,
    intensity: 'Medium',
    heartRate: 120
  });

  // Calculate statistics
  const totalCalories = exercises.reduce((sum, ex) => sum + ex.calories, 0);
  const totalDuration = exercises.reduce((sum, ex) => sum + parseInt(ex.duration), 0);
  const avgCalories = Math.round(totalCalories / exercises.length) || 0;
  const avgHeartRate = Math.round(exercises.reduce((sum, ex) => sum + (ex.heartRate || 120), 0) / exercises.length) || 120;
  
  // Filter exercises by type
  const filteredExercises = selectedType === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.type === selectedType);
  
  // Get exercise type counts
  const typeCounts = {
    cardio: exercises.filter(ex => ex.type === 'Cardio').length,
    strength: exercises.filter(ex => ex.type === 'Strength').length,
    flexibility: exercises.filter(ex => ex.type === 'Flexibility').length
  };

  // Handle adding new exercise
  const handleAddExercise = () => {
    if (!newExercise.name.trim()) {
      alert('Please enter exercise name');
      return;
    }

    const newExerciseObj: Exercise = {
      id: exercises.length > 0 ? Math.max(...exercises.map(e => e.id)) + 1 : 1,
      name: newExercise.name,
      type: newExercise.type,
      duration: `${newExercise.duration} min`,
      calories: parseInt(newExercise.calories.toString()),
      intensity: newExercise.intensity,
      heartRate: newExercise.heartRate,
      date: new Date().toISOString().split('T')[0]
    };

    setExercises([newExerciseObj, ...exercises]);
    setNewExercise({
      name: '',
      type: 'Cardio',
      duration: '30',
      calories: 100,
      intensity: 'Medium',
      heartRate: 120
    });
    setShowAddModal(false);
  };

  // Handle delete exercise
  const handleDeleteExercise = (id: number) => {
    setExercises(exercises.filter(ex => ex.id !== id));
    setDeleteConfirm(null);
  };

  // Handle form input changes
  const handleInputChange = (e: ChangeEvent<FormControlElement>) => {
    const { name, value } = e.target;
    setNewExercise(prev => ({
      ...prev,
      [name]: name === 'calories' || name === 'heartRate' || name === 'duration' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedType('all');
  };

  // Get badge color based on type
  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'Cardio': return 'danger';
      case 'Strength': return 'primary';
      case 'Flexibility': return 'success';
      default: return 'secondary';
    }
  };

  // Get intensity color
  const getIntensityColor = (intensity?: string) => {
    switch(intensity) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'danger';
      default: return 'secondary';
    }
  };

  // Generate AI Exercise Recommendations
  const generateAIRecommendations = async () => {
    setIsGeneratingAI(true);
    try {
      // Prepare exercise data for AI
      const exerciseSummary = {
        totalExercises: exercises.length,
        totalCalories,
        totalDuration,
        avgCalories,
        avgHeartRate,
        exerciseTypes: typeCounts,
        recentExercises: exercises.slice(0, 5).map(ex => ({
          name: ex.name,
          type: ex.type,
          duration: ex.duration,
          calories: ex.calories,
          intensity: ex.intensity
        }))
      };

      // Get AI recommendations
      const prompt = `As a professional fitness trainer and nutritionist, analyze this user's exercise data and provide personalized recommendations:
      
      EXERCISE SUMMARY:
      ${JSON.stringify(exerciseSummary, null, 2)}
      
      Please provide comprehensive recommendations including:
      1. Recommended new exercises based on their current routine
      2. A weekly workout plan
      3. Nutrition tips for better performance
      4. Recovery advice
      5. Progress timeline
      
      Return ONLY valid JSON with this exact structure:
      {
        "recommendedExercises": [
          {
            "name": "Exercise Name",
            "type": "Cardio/Strength/Flexibility",
            "duration": "30 min",
            "calories": 250,
            "intensity": "Medium",
            "description": "Brief description",
            "benefits": ["Benefit 1", "Benefit 2"]
          }
        ],
        "workoutPlan": {
          "weeklySchedule": [
            {
              "day": "Monday",
              "exercises": ["Exercise 1", "Exercise 2"],
              "focus": "Focus area"
            }
          ],
          "restDays": ["Saturday", "Sunday"],
          "progression": "Weekly progression plan"
        },
        "nutritionTips": ["Tip 1", "Tip 2"],
        "recoveryTips": ["Tip 1", "Tip 2"],
        "progressTimeline": "Expected timeline for results"
      }`;

      const result = await GeminiService.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean response
      const cleanedText = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      const jsonText = cleanedText.substring(jsonStart, jsonEnd);
      
      const recommendations = JSON.parse(jsonText);
      setAiRecommendations(recommendations);
      setShowAIRecommendations(true);
      
    } catch (error) {
      console.error('AI recommendation error:', error);
      alert('Failed to generate AI recommendations. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Download AI Report
  const downloadAIReport = () => {
    if (!aiRecommendations) return;
    
    const reportContent = `
AI FITNESS ASSISTANT - PERSONALIZED EXERCISE REPORT
Generated on: ${new Date().toLocaleDateString()}

=== EXERCISE SUMMARY ===
Total Exercises: ${exercises.length}
Total Calories Burned: ${totalCalories}
Total Duration: ${totalDuration} minutes
Average Calories per Exercise: ${avgCalories}
Average Heart Rate: ${avgHeartRate} BPM

Exercise Type Distribution:
- Cardio: ${typeCounts.cardio} exercises
- Strength: ${typeCounts.strength} exercises  
- Flexibility: ${typeCounts.flexibility} exercises

=== AI RECOMMENDED EXERCISES ===
${aiRecommendations.recommendedExercises.map(ex => `
${ex.name} (${ex.type})
Duration: ${ex.duration}
Calories: ${ex.calories}
Intensity: ${ex.intensity}
Description: ${ex.description}
Benefits: ${ex.benefits.join(', ')}
`).join('\n')}

=== WEEKLY WORKOUT PLAN ===
${aiRecommendations.workoutPlan.weeklySchedule.map(day => `
${day.day} (${day.focus}):
${day.exercises.map(ex => `  • ${ex}`).join('\n')}
`).join('\n')}

Rest Days: ${aiRecommendations.workoutPlan.restDays.join(', ')}
Progression Plan: ${aiRecommendations.workoutPlan.progression}

=== NUTRITION TIPS ===
${aiRecommendations.nutritionTips.map(tip => `• ${tip}`).join('\n')}

=== RECOVERY TIPS ===
${aiRecommendations.recoveryTips.map(tip => `• ${tip}`).join('\n')}

=== PROGRESS TIMELINE ===
${aiRecommendations.progressTimeline}

=== PERSONALIZED ADVICE ===
Based on your exercise history, here are specific recommendations:
${exercises.length > 0 ? 
  `You've been focusing on ${typeCounts.cardio > typeCounts.strength ? 'cardio' : 'strength'} exercises. ` +
  `Consider adding more ${typeCounts.cardio < 2 ? 'cardio' : typeCounts.strength < 2 ? 'strength training' : 'flexibility'} for balanced fitness.`
  : 'Start with basic exercises and gradually increase intensity.'}

Your average heart rate of ${avgHeartRate} BPM suggests ${avgHeartRate < 130 ? 'moderate intensity workouts' : 'high intensity workouts'}. 
${avgHeartRate > 140 ? 'Consider incorporating more recovery days.' : 'You can safely increase workout intensity.'}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-ai-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle chatbot message
  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserMessage('');
    setIsChatbotTyping(true);

    try {
      // Prepare context from exercise data
      const exerciseContext = `
User's Exercise History:
- Total Exercises: ${exercises.length}
- Total Calories Burned: ${totalCalories}
- Total Workout Time: ${totalDuration} minutes
- Average Heart Rate: ${avgHeartRate} BPM
- Exercise Types: ${typeCounts.cardio} Cardio, ${typeCounts.strength} Strength, ${typeCounts.flexibility} Flexibility
- Recent Exercises: ${exercises.slice(0, 3).map(ex => `${ex.name} (${ex.type})`).join(', ')}
`;

      const prompt = `You are an AI fitness assistant. User asks: "${userMessage}"
      
      User's exercise context:
      ${exerciseContext}
      
      Provide helpful, personalized fitness advice based on their exercise history. 
      Be encouraging and specific. Keep response concise but informative.`;
      
      const result = await GeminiService.model.generateContent(prompt);
      const response = await result.response;
      const aiText = response.text();
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: 'ai',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request. Please try again or ask a different question about exercise, nutrition, or fitness.",
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatbotTyping(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="stat-card h-100">
          <Card.Header className="border-0 bg-transparent">
            <Card.Title className="mb-0 fw-bold d-flex align-items-center gap-2 text-white">
              <Dumbbell size={20} className="text-gradient" />
              💪 Exercise Tracker
            </Card.Title>
            <small className="text-muted">Track and manage your workout activities with AI assistance</small>
          </Card.Header>
          <Card.Body>
            {/* Advanced Stats Row */}
            <Row className="mb-4">
              <Col lg={3} md={6}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="border-0 h-100" style={{ 
                    background: 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)',
                    borderRadius: '15px',
                    borderLeft: '4px solid #dc3545'
                  }}>
                    <Card.Body className="text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Flame size={18} className="text-danger" />
                        <div className="fw-bold text-white">Calories</div>
                      </div>
                      <h3 className="fw-bold mb-0 text-gradient">{totalCalories}</h3>
                      <small className="text-muted">Total burned</small>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
              <Col lg={3} md={6}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="border-0 h-100" style={{ 
                    background: 'linear-gradient(135deg, rgba(13, 110, 253, 0.1) 0%, rgba(13, 110, 253, 0.05) 100%)',
                    borderRadius: '15px',
                    borderLeft: '4px solid #0d6efd'
                  }}>
                    <Card.Body className="text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Clock size={18} className="text-primary" />
                        <div className="fw-bold text-white">Duration</div>
                      </div>
                      <h3 className="fw-bold mb-0 text-gradient">{totalDuration} min</h3>
                      <small className="text-muted">Active time</small>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
              <Col lg={3} md={6}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="border-0 h-100" style={{ 
                    background: 'linear-gradient(135deg, rgba(25, 135, 84, 0.1) 0%, rgba(25, 135, 84, 0.05) 100%)',
                    borderRadius: '15px',
                    borderLeft: '4px solid #198754'
                  }}>
                    <Card.Body className="text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Zap size={18} className="text-success" />
                        <div className="fw-bold text-white">Avg Calories</div>
                      </div>
                      <h3 className="fw-bold mb-0 text-gradient">{avgCalories}</h3>
                      <small className="text-muted">Per exercise</small>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
              <Col lg={3} md={6}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Card className="border-0 h-100" style={{ 
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                    borderRadius: '15px',
                    borderLeft: '4px solid #ffc107'
                  }}>
                    <Card.Body className="text-center py-3">
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                        <Heart size={18} className="text-warning" />
                        <div className="fw-bold text-white">Avg Heart Rate</div>
                      </div>
                      <h3 className="fw-bold mb-0 text-gradient">{avgHeartRate}</h3>
                      <small className="text-muted">BPM</small>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {/* AI Assistant Button Row */}
            <Row className="mb-4">
              <Col md={12}>
                <div className="d-flex flex-wrap gap-2 justify-content-center mb-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="info" 
                      className="btn-modern d-flex align-items-center gap-2"
                      onClick={() => setShowChatbot(true)}
                    >
                      <Bot size={18} />
                      AI Fitness Assistant
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="warning" 
                      className="btn-modern d-flex align-items-center gap-2"
                      onClick={generateAIRecommendations}
                      disabled={isGeneratingAI}
                    >
                      <Brain size={18} />
                      {isGeneratingAI ? 'Generating...' : 'Get AI Recommendations'}
                    </Button>
                  </motion.div>
                  {aiRecommendations && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="success" 
                        className="btn-modern d-flex align-items-center gap-2"
                        onClick={downloadAIReport}
                      >
                        <Download size={18} />
                        Download AI Report
                      </Button>
                    </motion.div>
                  )}
                </div>
              </Col>
            </Row>

            {/* Filter Bar */}
            <div className="mb-4 p-3 border rounded bg-dark">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <Filter size={16} className="text-muted" />
                    <span className="fw-semibold text-white">Filter by Type:</span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant={selectedType === 'all' ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedType('all')}
                      className="btn-modern"
                    >
                      All ({exercises.length})
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedType === 'Cardio' ? 'danger' : 'outline-secondary'}
                      onClick={() => setSelectedType('Cardio')}
                      className="btn-modern"
                    >
                      Cardio ({typeCounts.cardio})
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedType === 'Strength' ? 'primary' : 'outline-secondary'}
                      onClick={() => setSelectedType('Strength')}
                      className="btn-modern"
                    >
                      Strength ({typeCounts.strength})
                    </Button>
                    <Button 
                      size="sm" 
                      variant={selectedType === 'Flexibility' ? 'success' : 'outline-secondary'}
                      onClick={() => setSelectedType('Flexibility')}
                      className="btn-modern"
                    >
                      Flexibility ({typeCounts.flexibility})
                    </Button>
                  </div>
                </div>
                {selectedType !== 'all' && (
                  <Button 
                    size="sm" 
                    variant="outline-light" 
                    onClick={resetFilters}
                    className="btn-modern"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            </div>
            
            {/* Exercises Table */}
            <Table hover size="sm" className="modern-table mb-4" style={{ 
              color: '#ffffff',
              backgroundColor: 'transparent'
            }}>
              <thead>
                <tr>
                  <th className="text-white">Exercise</th>
                  <th className="text-white">Type</th>
                  <th className="text-white">Intensity</th>
                  <th className="text-white">Duration</th>
                  <th className="text-white">Calories</th>
                  <th className="text-white">Heart Rate</th>
                  <th className="text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((exercise, index) => (
                  <motion.tr 
                    key={exercise.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ backgroundColor: 'rgba(25, 118, 210, 0.1)' }}
                    style={{ color: '#ffffff' }}
                  >
                    <td className="fw-semibold" style={{ color: '#ffffff', fontWeight: '600' }}>
                      <div className="d-flex align-items-center gap-2">
                        <Activity size={16} className="text-info" />
                        <span style={{ color: '#ffffff' }}>{exercise.name}</span>
                      </div>
                    </td>
                    <td>
                      <Badge className="badge-modern" bg={getTypeBadgeColor(exercise.type)}>
                        {exercise.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge className="badge-modern" bg={getIntensityColor(exercise.intensity)}>
                        {exercise.intensity || 'Medium'}
                      </Badge>
                    </td>
                    <td style={{ color: '#ffffff', fontWeight: '500' }}>{exercise.duration}</td>
                    <td>
                      <Badge className="badge-modern" bg="warning" style={{ backgroundColor: '#ffc107' }}>
                        <div className="d-flex align-items-center gap-1">
                          <Flame size={12} />
                          <span className="text-dark fw-bold" style={{ color: '#000000' }}>{exercise.calories}</span>
                        </div>
                      </Badge>
                    </td>
                    <td style={{ color: '#ffffff', fontWeight: '500' }}>
                      <div className="d-flex align-items-center gap-2">
                        <Heart size={14} className="text-danger" />
                        <span style={{ color: '#ffffff', fontWeight: '500' }}>{exercise.heartRate || '120'} BPM</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="p-1 d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '32px', 
                            height: '32px',
                            borderColor: '#dc3545',
                            color: '#dc3545',
                            backgroundColor: 'rgba(220, 53, 69, 0.15)',
                            opacity: 1,
                            visibility: 'visible',
                            display: 'flex'
                          }}
                          onClick={() => setDeleteConfirm(exercise.id)}
                          title="Delete Exercise"
                        >
                          <Trash2 size={16} style={{ color: '#dc3545' }} />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </Table>

            {/* Action Buttons */}
            <div className="d-flex gap-2 justify-content-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="success" 
                  className="btn-modern btn-success-modern d-flex align-items-center gap-2"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus size={18} />
                  Add New Exercise
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="primary" 
                  className="btn-modern btn-primary-modern d-flex align-items-center gap-2"
                  onClick={() => setShowViewAll(true)}
                >
                  <Eye size={18} />
                  View All Details
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline-info" 
                  className="btn-modern d-flex align-items-center gap-2"
                  onClick={() => setShowStats(true)}
                >
                  <TrendingUp size={18} />
                  View Stats
                </Button>
              </motion.div>
            </div>
          </Card.Body>
        </Card>
      </motion.div>

      {/* AI Chatbot Modal */}
      <Modal show={showChatbot} onHide={() => setShowChatbot(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <Bot size={20} className="text-info" />
              <span>AI Fitness Assistant</span>
              <Badge bg="info" className="ms-2">Live</Badge>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          {/* Chat Messages */}
          <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '400px' }}>
            {chatMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-3 ${message.sender === 'user' ? 'text-end' : ''}`}
              >
                <div
                  className={`d-inline-block p-3 rounded-3 ${
                    message.sender === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{ maxWidth: '80%' }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    {message.sender === 'ai' && <Sparkles size={12} />}
                    <small className="opacity-75">
                      {message.sender === 'ai' ? 'AI Assistant' : 'You'} •{' '}
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  {message.text}
                </div>
              </motion.div>
            ))}
            {isChatbotTyping && (
              <div className="text-start mb-3">
                <div className="d-inline-block p-3 rounded-3 bg-secondary text-white">
                  <div className="d-flex align-items-center gap-2">
                    <Sparkles size={12} />
                    <small className="opacity-75">AI Assistant • Typing...</small>
                  </div>
                  <div className="d-flex gap-1 mt-2">
                    <div className="typing-dot" style={{ animationDelay: '0s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.2s' }}></div>
                    <div className="typing-dot" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="Ask about exercise, nutrition, or fitness advice..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="form-modern-control flex-grow-1"
            />
            <Button
              variant="primary"
              onClick={handleSendMessage}
              disabled={!userMessage.trim() || isChatbotTyping}
              className="btn-modern"
            >
              <MessageSquare size={18} />
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="mt-3">
            <small className="text-muted d-block mb-2">Quick suggestions:</small>
            <div className="d-flex flex-wrap gap-2">
              {[
                "Recommend exercises for me",
                "How can I burn more calories?",
                "Best post-workout nutrition",
                "Create a weekly workout plan"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline-light"
                  size="sm"
                  className="btn-modern"
                  onClick={() => {
                    setUserMessage(suggestion);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  disabled={isChatbotTyping}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <small className="text-muted">
            AI can see your exercise history: {exercises.length} exercises, {totalCalories} calories burned
          </small>
          <Button variant="secondary" className="btn-modern" onClick={() => setShowChatbot(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* AI Recommendations Modal */}
      <Modal show={showAIRecommendations} onHide={() => setShowAIRecommendations(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <Brain size={20} className="text-warning" />
              <span>AI-Powered Exercise Recommendations</span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          {aiRecommendations && (
            <>
              <Alert variant="info" className="bg-dark border-info mb-4">
                <div className="d-flex align-items-center gap-2">
                  <Sparkles size={18} />
                  <span className="text-white">
                    Personalized recommendations based on your exercise history
                  </span>
                </div>
              </Alert>

              {/* Recommended Exercises */}
              <Card className="border-0 bg-dark mb-4">
                <Card.Header className="border-0 bg-transparent">
                  <Card.Title className="text-white mb-0">Recommended Exercises</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {aiRecommendations.recommendedExercises.map((exercise, index) => (
                      <Col md={6} key={index}>
                        <Card className="border-0 bg-secondary-dark h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="text-white mb-0">{exercise.name}</h6>
                              <Badge bg={getTypeBadgeColor(exercise.type)}>
                                {exercise.type}
                              </Badge>
                            </div>
                            <div className="d-flex gap-3 mb-2">
                              <small className="text-muted">Duration: {exercise.duration}</small>
                              <small className="text-muted">Calories: {exercise.calories}</small>
                              <small className="text-muted">Intensity: {exercise.intensity}</small>
                            </div>
                            <p className="text-light mb-2">{exercise.description}</p>
                            <div>
                              <small className="text-muted d-block mb-1">Benefits:</small>
                              <div className="d-flex flex-wrap gap-1">
                                {exercise.benefits.map((benefit, i) => (
                                  <Badge key={i} bg="info" className="badge-modern">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Workout Plan */}
              <Card className="border-0 bg-dark mb-4">
                <Card.Header className="border-0 bg-transparent">
                  <Card.Title className="text-white mb-0">Weekly Workout Plan</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    {aiRecommendations.workoutPlan.weeklySchedule.map((day, index) => (
                      <Col md={6} lg={4} key={index}>
                        <Card className="border-0 bg-secondary-dark h-100">
                          <Card.Body>
                            <h6 className="text-white mb-2">{day.day}</h6>
                            <Badge bg="primary" className="mb-2">{day.focus}</Badge>
                            <ul className="mb-0 ps-3">
                              {day.exercises.map((exercise, i) => (
                                <li key={i} className="text-light mb-1">
                                  <small>{exercise}</small>
                                </li>
                              ))}
                            </ul>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="mt-3">
                    <small className="text-muted d-block mb-1">Rest Days: </small>
                    <Badge bg="secondary" className="me-2">
                      {aiRecommendations.workoutPlan.restDays.join(', ')}
                    </Badge>
                    <small className="text-muted d-block mt-2">Progression: {aiRecommendations.workoutPlan.progression}</small>
                  </div>
                </Card.Body>
              </Card>

              {/* Tips Section */}
              <Row className="g-3">
                <Col md={6}>
                  <Card className="border-0 bg-dark h-100">
                    <Card.Body>
                      <h6 className="text-white mb-3">Nutrition Tips</h6>
                      <ul className="mb-0">
                        {aiRecommendations.nutritionTips.map((tip, index) => (
                          <li key={index} className="text-light mb-2">
                            <small>{tip}</small>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-0 bg-dark h-100">
                    <Card.Body>
                      <h6 className="text-white mb-3">Recovery Tips</h6>
                      <ul className="mb-0">
                        {aiRecommendations.recoveryTips.map((tip, index) => (
                          <li key={index} className="text-light mb-2">
                            <small>{tip}</small>
                          </li>
                        ))}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Progress Timeline */}
              <Card className="border-0 bg-dark mt-4">
                <Card.Body>
                  <h6 className="text-white mb-3">Expected Progress Timeline</h6>
                  <p className="text-light mb-0">{aiRecommendations.progressTimeline}</p>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <Button variant="secondary" className="btn-modern" onClick={() => setShowAIRecommendations(false)}>
            Close
          </Button>
          <Button variant="success" className="btn-modern" onClick={downloadAIReport}>
            <Download size={18} className="me-2" />
            Download Report
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <Plus size={20} />
              Add New Exercise
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Exercise Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newExercise.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Running, Weight Lifting, Yoga"
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={newExercise.type}
                    onChange={handleInputChange}
                    className="form-modern-control"
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength Training</option>
                    <option value="Flexibility">Flexibility</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-white">Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    name="duration"
                    value={newExercise.duration}
                    onChange={handleInputChange}
                    min="1"
                    max="300"
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-white">Calories Burned</Form.Label>
                  <Form.Control
                    type="number"
                    name="calories"
                    value={newExercise.calories}
                    onChange={handleInputChange}
                    min="1"
                    max="2000"
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="text-white">Intensity</Form.Label>
                  <Form.Select
                    name="intensity"
                    value={newExercise.intensity}
                    onChange={handleInputChange}
                    className="form-modern-control"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Heart Rate (BPM)</Form.Label>
                  <Form.Control
                    type="number"
                    name="heartRate"
                    value={newExercise.heartRate}
                    onChange={handleInputChange}
                    min="50"
                    max="200"
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-white">Date</Form.Label>
                  <Form.Control
                    type="date"
                    className="form-modern-control"
                    defaultValue={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <Button variant="secondary" className="btn-modern" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="success" className="btn-modern btn-success-modern" onClick={handleAddExercise}>
            <Plus size={18} className="me-2" />
            Add Exercise
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirm !== null} onHide={() => setDeleteConfirm(null)} centered>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <Trash2 size={20} className="text-danger" />
              Confirm Delete
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-white">
          Are you sure you want to delete this exercise? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <Button variant="secondary" className="btn-modern" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="btn-modern btn-danger"
            onClick={() => handleDeleteExercise(deleteConfirm!)}
          >
            <Trash2 size={18} className="me-2" />
            Delete Exercise
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View All Modal */}
      <Modal show={showViewAll} onHide={() => setShowViewAll(false)} size="xl" centered scrollable>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <Eye size={20} />
              All Exercise Records
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Alert variant="info" className="bg-dark border-info">
            <div className="d-flex align-items-center gap-2">
              <Target size={18} />
              <span className="text-white">Total Exercises: {exercises.length}</span>
            </div>
          </Alert>
          
          <div className="table-responsive">
            <Table hover className="modern-table" style={{ color: '#ffffff' }}>
              <thead>
                <tr>
                  <th className="text-white">#</th>
                  <th className="text-white">Exercise</th>
                  <th className="text-white">Type</th>
                  <th className="text-white">Intensity</th>
                  <th className="text-white">Duration</th>
                  <th className="text-white">Calories</th>
                  <th className="text-white">Heart Rate</th>
                  <th className="text-white">Date</th>
                  <th className="text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td style={{ color: '#ffffff' }}>{exercise.id}</td>
                    <td className="fw-semibold" style={{ color: '#ffffff' }}>{exercise.name}</td>
                    <td>
                      <Badge className="badge-modern" bg={getTypeBadgeColor(exercise.type)}>
                        {exercise.type}
                      </Badge>
                    </td>
                    <td>
                      <Badge className="badge-modern" bg={getIntensityColor(exercise.intensity)}>
                        {exercise.intensity || 'Medium'}
                      </Badge>
                    </td>
                    <td style={{ color: '#ffffff' }}>{exercise.duration}</td>
                    <td>
                      <Badge className="badge-modern" bg="warning" style={{ backgroundColor: '#ffc107' }}>
                        <span className="text-dark fw-bold">{exercise.calories}</span>
                      </Badge>
                    </td>
                    <td style={{ color: '#ffffff' }}>{exercise.heartRate || '120'} BPM</td>
                    <td style={{ color: '#ffffff' }}>{exercise.date || 'Today'}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="p-1 d-flex align-items-center justify-content-center"
                        style={{ 
                          width: '32px', 
                          height: '32px',
                          borderColor: '#dc3545',
                          color: '#dc3545'
                        }}
                        onClick={() => {
                          setShowViewAll(false);
                          setTimeout(() => setDeleteConfirm(exercise.id), 100);
                        }}
                        title="Delete Exercise"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-3 border rounded bg-dark">
            <h6 className="mb-3 text-white">Summary</h6>
            <Row>
              <Col md={3} className="text-center">
                <div className="text-muted">Total Calories</div>
                <div className="h4 fw-bold text-warning">{totalCalories}</div>
              </Col>
              <Col md={3} className="text-center">
                <div className="text-muted">Total Duration</div>
                <div className="h4 fw-bold text-primary">{totalDuration} min</div>
              </Col>
              <Col md={3} className="text-center">
                <div className="text-muted">Cardio Exercises</div>
                <div className="h4 fw-bold text-danger">{typeCounts.cardio}</div>
              </Col>
              <Col md={3} className="text-center">
                <div className="text-muted">Avg Heart Rate</div>
                <div className="h4 fw-bold text-info">{avgHeartRate} BPM</div>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <Button variant="secondary" className="btn-modern" onClick={() => setShowViewAll(false)}>
            Close
          </Button>
          <Button variant="primary" className="btn-modern btn-primary-modern">
            Export Data
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Stats Modal */}
      <Modal show={showStats} onHide={() => setShowStats(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 bg-dark">
          <Modal.Title className="text-white">
            <div className="d-flex align-items-center gap-2">
              <TrendingUp size={20} />
              Exercise Statistics
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <Row className="g-3">
            <Col md={6}>
              <Card className="border-0 bg-dark h-100">
                <Card.Body>
                  <h6 className="text-white mb-3">Exercise Distribution</h6>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white">Cardio</span>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ width: '100px', height: '8px' }}>
                          <div 
                            className="progress-bar bg-danger" 
                            style={{ width: `${(typeCounts.cardio / exercises.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white">{typeCounts.cardio}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white">Strength</span>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ width: '100px', height: '8px' }}>
                          <div 
                            className="progress-bar bg-primary" 
                            style={{ width: `${(typeCounts.strength / exercises.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white">{typeCounts.strength}</span>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-white">Flexibility</span>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ width: '100px', height: '8px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            style={{ width: `${(typeCounts.flexibility / exercises.length) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-white">{typeCounts.flexibility}</span>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 bg-dark h-100">
                <Card.Body>
                  <h6 className="text-white mb-3">Performance Metrics</h6>
                  <div className="d-flex flex-column gap-3">
                    <div>
                      <small className="text-muted">Average Calories per Exercise</small>
                      <div className="h4 fw-bold text-warning">{avgCalories}</div>
                    </div>
                    <div>
                      <small className="text-muted">Average Duration</small>
                      <div className="h4 fw-bold text-primary">{Math.round(totalDuration / exercises.length)} min</div>
                    </div>
                    <div>
                      <small className="text-muted">Average Heart Rate</small>
                      <div className="h4 fw-bold text-danger">{avgHeartRate} BPM</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={12}>
              <Card className="border-0 bg-dark">
                <Card.Body>
                  <h6 className="text-white mb-3">Recommendations</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2 d-flex align-items-start gap-2">
                      <div className="mt-1">
                        <div className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                      <small className="text-white">
                        You've burned {totalCalories} calories today. Great job!
                      </small>
                    </li>
                    <li className="mb-2 d-flex align-items-start gap-2">
                      <div className="mt-1">
                        <div className="rounded-circle bg-info" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                      <small className="text-white">
                        Consider adding more {typeCounts.cardio < 2 ? 'cardio' : typeCounts.strength < 2 ? 'strength' : 'flexibility'} exercises for balanced training.
                      </small>
                    </li>
                    <li className="d-flex align-items-start gap-2">
                      <div className="mt-1">
                        <div className="rounded-circle bg-warning" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                      <small className="text-white">
                        Your average heart rate of {avgHeartRate} BPM indicates {avgHeartRate < 130 ? 'moderate' : 'intense'} workout intensity.
                      </small>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="border-0 bg-dark">
          <Button variant="secondary" className="btn-modern" onClick={() => setShowStats(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add CSS for typing animation */}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #ffffff;
          opacity: 0.6;
          animation: typing 1.4s infinite;
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        /* Fix table text visibility */
        .stat-card table td,
        .stat-card table td span:not(.text-dark),
        .stat-card table td div:not(.text-dark) {
          color: white !important;
        }
      `}</style>
    </>
  );
}