import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, ProgressBar, Accordion, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  Target, 
  Dumbbell, 
  Apple, 
  Heart, 
  Zap, 
  Calculator,
  Brain,
  Calendar,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';
import geminiService from '../services/geminiService';

interface BMIRecommendation {
  idealWeight: number;
  recommendedCalories: number;
  dietPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  workoutPlan: {
    cardio: string[];
    strength: string[];
    frequency: string;
    duration: string;
  };
  geneticFactors: string[];
  timeframe: string;
  healthTips: string[];
}

export default function BMICalculator() {
  // Basic info
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  
  // Advanced info
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');
  const [familyHistory, setFamilyHistory] = useState('none');
  const [metabolism, setMetabolism] = useState('average');
  
  // Results
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<BMIRecommendation | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const calculateBMI = async () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height) / 100;
    const calculatedBMI = weightNum / (heightNum * heightNum);
    const roundedBMI = parseFloat(calculatedBMI.toFixed(1));
    
    setBmi(roundedBMI);

    if (calculatedBMI < 18.5) setCategory('Underweight');
    else if (calculatedBMI < 25) setCategory('Normal');
    else if (calculatedBMI < 30) setCategory('Overweight');
    else setCategory('Obese');

    // Get AI recommendations
    if (age && activityLevel && goal) {
      setLoading(true);
      try {
        const recommendations = await geminiService.getBMIRecommendations(
          roundedBMI,
          weightNum,
          parseFloat(height),
          parseInt(age),
          gender,
          activityLevel,
          goal,
          familyHistory,
          metabolism
        );
        setAiRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to get AI recommendations:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getBMIColor = () => {
    if (!bmi) return 'primary';
    if (bmi < 18.5) return 'info';
    if (bmi < 25) return 'success';
    if (bmi < 30) return 'warning';
    return 'danger';
  };

  const getProgressValue = () => {
    if (!bmi) return 0;
    // Normalize BMI to 0-100% for progress bar
    return Math.min(Math.max((bmi - 15) / (40 - 15) * 100, 0), 100);
  };

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="stat-card h-100">
        <Card.Header className="border-0 bg-transparent">
          <Card.Title className="mb-0 fw-bold d-flex align-items-center gap-2">
            <Brain size={20} className="text-gradient" />
            🤖 AI-Powered BMI Calculator
          </Card.Title>
          <small className="text-muted">Get personalized recommendations based on your profile</small>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-6">
              <Form className="form-modern">
                <h5 className="mb-3 fw-semibold d-flex align-items-center gap-2">
                  <Calculator size={18} />
                  Basic Information
                </h5>
                
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-white">Weight (kg)</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 70"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="form-modern-control"
                        min="30"
                        max="200"
                      />
                      <Form.Text className="text-muted">
                        Measure in the morning after using restroom
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-white">Height (cm)</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 175"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="form-modern-control"
                        min="100"
                        max="250"
                      />
                      <Form.Text className="text-muted">
                        Stand straight without shoes against wall
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="g-3 mt-2">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-white">Age</Form.Label>
                      <Form.Control 
                        type="number" 
                        placeholder="e.g., 25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="form-modern-control"
                        min="15"
                        max="100"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-white">Gender</Form.Label>
                      <Form.Select 
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="form-modern-control"
                      >
                        <option value="male" className="text-dark">Male</option>
                        <option value="female" className="text-dark">Female</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Advanced Options Toggle */}
                <div className="mt-4">
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none d-flex align-items-center gap-1 text-white"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? '▲' : '▼'} Advanced Options
                  </Button>
                  
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 border rounded bg-dark"
                    >
                      <h6 className="mb-3 fw-semibold d-flex align-items-center gap-2 text-white">
                        <Activity size={16} />
                        Lifestyle & Genetics
                      </h6>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center gap-2 text-white">
                          <Zap size={16} />
                          Activity Level
                        </Form.Label>
                        <Form.Select 
                          value={activityLevel}
                          onChange={(e) => setActivityLevel(e.target.value)}
                          className="form-modern-control"
                        >
                          <option value="sedentary" className="text-dark">Sedentary (office job, no exercise)</option>
                          <option value="light" className="text-dark">Light (1-3 days/week)</option>
                          <option value="moderate" className="text-dark">Moderate (3-5 days/week)</option>
                          <option value="active" className="text-dark">Active (6-7 days/week)</option>
                          <option value="veryActive" className="text-dark">Very Active (athlete/training)</option>
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold d-flex align-items-center gap-2 text-white">
                          <Target size={16} />
                          Goal
                        </Form.Label>
                        <Form.Select 
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="form-modern-control"
                        >
                          <option value="lose" className="text-dark">Lose Weight</option>
                          <option value="maintain" className="text-dark">Maintain Weight</option>
                          <option value="gain" className="text-dark">Gain Weight/Muscle</option>
                        </Form.Select>
                      </Form.Group>

                      <Row className="g-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold d-flex align-items-center gap-2 text-white">
                              <Heart size={16} />
                              Family History
                            </Form.Label>
                            <Form.Select 
                              value={familyHistory}
                              onChange={(e) => setFamilyHistory(e.target.value)}
                              className="form-modern-control"
                            >
                              <option value="none" className="text-dark">No weight issues</option>
                              <option value="overweight" className="text-dark">Overweight parents</option>
                              <option value="obese" className="text-dark">Obese family members</option>
                              <option value="diabetes" className="text-dark">Diabetes in family</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="fw-semibold text-white">Metabolism Type</Form.Label>
                            <Form.Select 
                              value={metabolism}
                              onChange={(e) => setMetabolism(e.target.value)}
                              className="form-modern-control"
                            >
                              <option value="slow" className="text-dark">Slow (gain weight easily)</option>
                              <option value="average" className="text-dark">Average</option>
                              <option value="fast" className="text-dark">Fast (hard to gain weight)</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                    </motion.div>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-4">
                  <Button 
                    variant="primary" 
                    onClick={calculateBMI} 
                    disabled={!weight || !height || !age}
                    className="w-100 btn-modern btn-primary-modern d-flex align-items-center justify-content-center gap-2"
                  >
                    <Brain size={18} />
                    {loading ? 'Analyzing with AI...' : 'Calculate & Get AI Recommendations'}
                  </Button>
                </motion.div>
              </Form>
            </div>

            <div className="col-md-6">
              {/* BMI Results */}
              {bmi && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 rounded-3 h-100 results-section-dark"
                >
                  <div className="text-center mb-4">
                    <h4 className="fw-bold mb-3 d-flex align-items-center justify-content-center gap-2 text-white">
                      <TrendingUp size={20} />
                      Your BMI Analysis
                    </h4>
                    
                    <div className="position-relative d-inline-block mb-4">
                      <div className="display-1 fw-bold mb-0 text-white">
                        {bmi}
                      </div>
                      <Badge 
                        bg={getBMIColor()} 
                        className="position-absolute top-0 start-100 translate-middle badge-modern-dark px-3 py-2"
                      >
                        {category}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between mb-2">
                        <small className="text-white">Underweight</small>
                        <small className="text-white">Normal</small>
                        <small className="text-white">Overweight</small>
                        <small className="text-white">Obese</small>
                      </div>
                      <ProgressBar 
                        now={getProgressValue()}
                        variant={getBMIColor()}
                        className="custom-progress-dark"
                        style={{ height: '12px', borderRadius: '6px' }}
                      />
                      <div className="d-flex justify-content-between mt-1">
                        <small className="text-white">15</small>
                        <small className="text-white">18.5</small>
                        <small className="text-white">25</small>
                        <small className="text-white">30</small>
                        <small className="text-white">40+</small>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  {aiRecommendations && (
                    <div className="mt-4">
                      <h5 className="fw-semibold mb-3 d-flex align-items-center gap-2 text-white">
                        <Brain size={18} className="text-primary" />
                        🤖 AI-Powered Recommendations
                      </h5>

                      <Accordion defaultActiveKey={['0']} alwaysOpen>
                        {/* 1. Smart Goal Setting */}
                        <Accordion.Item eventKey="0" className="mb-3 border-0 bg-dark">
                          <Accordion.Header className="accordion-dark">
                            <div className="d-flex align-items-center gap-2">
                              <Target size={16} className="text-success" />
                              <span className="fw-semibold text-white">Smart Goal Setting</span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="p-3 accordion-body-dark">
                            <div className="row g-3">
                              <div className="col-6">
                                <div className="p-2 border rounded text-center box-dark">
                                  <small className="text-white d-block">Ideal Weight</small>
                                  <div className="fw-bold h5 mb-0 text-white">{aiRecommendations.idealWeight} kg</div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="p-2 border rounded text-center box-dark">
                                  <small className="text-white d-block">Daily Calories</small>
                                  <div className="fw-bold h5 mb-0 text-white">{aiRecommendations.recommendedCalories}</div>
                                </div>
                              </div>
                              <div className="col-12">
                                <div className="p-2 border rounded text-center box-dark">
                                  <small className="text-white d-block">Target Timeframe</small>
                                  <div className="fw-bold h5 mb-0 d-flex align-items-center justify-content-center gap-2 text-white">
                                    <Calendar size={16} />
                                    {aiRecommendations.timeframe}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>

                        {/* 2. Personalized Diet Plan */}
                        <Accordion.Item eventKey="1" className="mb-3 border-0 bg-dark">
                          <Accordion.Header className="accordion-dark">
                            <div className="d-flex align-items-center gap-2">
                              <Apple size={16} className="text-danger" />
                              <span className="fw-semibold text-white">Personalized Diet Plan</span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="p-3 accordion-body-dark">
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="p-2 border rounded box-dark">
                                  <small className="text-white d-block">Breakfast</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.dietPlan.breakfast}</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="p-2 border rounded box-dark">
                                  <small className="text-white d-block">Lunch</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.dietPlan.lunch}</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="p-2 border rounded box-dark">
                                  <small className="text-white d-block">Dinner</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.dietPlan.dinner}</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="p-2 border rounded box-dark">
                                  <small className="text-white d-block">Snacks</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.dietPlan.snacks}</small>
                                </div>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>

                        {/* 3. Workout Recommendations */}
                        <Accordion.Item eventKey="2" className="mb-3 border-0 bg-dark">
                          <Accordion.Header className="accordion-dark">
                            <div className="d-flex align-items-center gap-2">
                              <Dumbbell size={16} className="text-warning" />
                              <span className="fw-semibold text-white">Workout Recommendations</span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="p-3 accordion-body-dark">
                            <div className="mb-3">
                              <small className="text-white d-block mb-1">Cardio</small>
                              <div className="d-flex flex-wrap gap-2">
                                {aiRecommendations.workoutPlan.cardio.map((exercise, idx) => (
                                  <Badge key={idx} bg="info" className="badge-modern-dark">
                                    {exercise}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <small className="text-white d-block mb-1">Strength Training</small>
                              <div className="d-flex flex-wrap gap-2">
                                {aiRecommendations.workoutPlan.strength.map((exercise, idx) => (
                                  <Badge key={idx} bg="warning" className="badge-modern-dark">
                                    {exercise}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="row g-2">
                              <div className="col-6">
                                <div className="p-2 border rounded text-center box-dark">
                                  <small className="text-white d-block">Frequency</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.workoutPlan.frequency}</small>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="p-2 border rounded text-center box-dark">
                                  <small className="text-white d-block">Duration</small>
                                  <small className="fw-semibold text-white">{aiRecommendations.workoutPlan.duration}</small>
                                </div>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>

                        {/* 4. Genetic Factors */}
                        <Accordion.Item eventKey="3" className="border-0 bg-dark">
                          <Accordion.Header className="accordion-dark">
                            <div className="d-flex align-items-center gap-2">
                              <Shield size={16} className="text-danger" />
                              <span className="fw-semibold text-white">Genetic & Health Factors</span>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body className="p-3 accordion-body-dark">
                            <ul className="list-unstyled mb-0">
                              {aiRecommendations.geneticFactors.map((factor, idx) => (
                                <li key={idx} className="mb-2 d-flex align-items-start gap-2">
                                  <div className="mt-1">
                                    <div className="rounded-circle bg-primary" style={{ width: '6px', height: '6px' }}></div>
                                  </div>
                                  <small className="text-white">{factor}</small>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-3">
                              <small className="text-white d-block mb-2">Health Tips:</small>
                              <div className="d-flex flex-wrap gap-2">
                                {aiRecommendations.healthTips.map((tip, idx) => (
                                  <Badge key={idx} bg="light" text="dark" className="badge-modern-dark">
                                    {tip}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Empty State */}
              {!bmi && (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center p-5 empty-state-dark">
                  <div className="display-1 mb-3 text-white opacity-25">
                    <Brain size={80} />
                  </div>
                  <h5 className="fw-semibold mb-2 text-white">AI-Powered BMI Analysis</h5>
                  <p className="text-white mb-4">
                    Enter your details to get personalized recommendations including diet plans, workout routines, and genetic considerations.
                  </p>
                  <div className="d-flex flex-wrap gap-2 justify-content-center">
                    <Badge bg="info" className="badge-modern-dark">Smart Goal Setting</Badge>
                    <Badge bg="success" className="badge-modern-dark">Diet Plans</Badge>
                    <Badge bg="warning" className="badge-modern-dark">Workout Routines</Badge>
                    <Badge bg="danger" className="badge-modern-dark">Genetic Factors</Badge>
                  </div>
                </div>
              )}
            </div>
          </div> 
        </Card.Body>
      </Card>
    </motion.div>
  );
}