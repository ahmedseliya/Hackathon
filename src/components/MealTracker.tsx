// In MealTracker.tsx, update the import and remove the duplicate interface
import { Card, Table, Button, Badge, Form, Modal, Row, Col } from 'react-bootstrap';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { sampleMeals, type Meal } from '../data/sampleData'; // Import Meal interface
import AIMealDetection from './AIMealDetection';

// Remove this duplicate interface since we're importing it
// interface Meal {
//   id: number;
//   name: string;
//   time: string;
//   calories: number;
//   protein: number;
//   carbs: number;
//   fat: number;
//   type: string;
//   source?: 'ai' | 'manual';
//   confidence?: string;
// }

// Keep AIData and NewMealForm interfaces
interface AIData {
  foodItems: string[];
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
  confidence: string;
  mealType: string;
}

interface NewMealForm {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  type: string;
}

export default function MealTracker() {
  const [meals, setMeals] = useState<Meal[]>(sampleMeals);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newMeal, setNewMeal] = useState<NewMealForm>({ 
    name: '', 
    calories: '', 
    protein: '', 
    carbs: '', 
    fat: '', 
    type: 'Breakfast' 
  });

  // Handle AI-detected meal
  const handleAIMealDetected = (aiData: AIData) => {
    const mealName = aiData.foodItems?.join(', ') || 'AI-Detected Meal';
    
    const meal: Meal = {
      id: Date.now(),
      name: mealName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: aiData.estimatedCalories || 0,
      protein: aiData.estimatedProtein || 0,
      carbs: aiData.estimatedCarbs || 0,
      fat: aiData.estimatedFat || 0,
      type: aiData.mealType || 'Lunch',
      source: 'ai',
      confidence: aiData.confidence || 'medium'
    };
    
    setMeals([...meals, meal]);
    
    // Show success message
    alert(`✅ AI detected: ${mealName}\nCalories: ${meal.calories}\nProtein: ${meal.protein}g`);
  };

  const addMeal = () => {
    if (newMeal.name && newMeal.calories) {
      const meal: Meal = {
        id: Date.now(),
        name: newMeal.name,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        calories: parseInt(newMeal.calories) || 0,
        protein: parseInt(newMeal.protein) || 0,
        carbs: parseInt(newMeal.carbs) || 0,
        fat: parseInt(newMeal.fat) || 0,
        type: newMeal.type,
        source: 'manual'
      };
      setMeals([...meals, meal]);
      setNewMeal({ name: '', calories: '', protein: '', carbs: '', fat: '', type: 'Breakfast' });
      setShowAddModal(false);
    }
  };

  const deleteMeal = (id: number) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);

  return (
    <motion.div
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="stat-card">
        <Card.Header className="border-0 bg-transparent d-flex justify-content-between align-items-center">
          <div>
            <Card.Title className="mb-0 fw-bold text-gradient">🍽️ Today's Meals</Card.Title>
            <small className="text-muted">Track your daily nutrition intake with AI</small>
          </div>
          
          <div className="d-flex gap-2">
            <AIMealDetection onMealDetected={handleAIMealDetected} />
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => setShowAddModal(true)}
                className="btn-modern btn-primary-modern"
              >
                + Add Meal
              </Button>
            </motion.div>
          </div>
        </Card.Header>
        
        <Card.Body>
          <div className="mb-4">
            <Badge bg="success" className="badge-modern me-2 p-2 d-inline-flex align-items-center">
              <span className="fw-bold">🤖 AI-Powered:</span> 
              <span className="ms-1">Camera, Voice & Text Input</span>
            </Badge>
            <Badge bg="warning" className="badge-modern me-2 p-2">
              <span className="fw-bold">Total Calories:</span> {totalCalories}
            </Badge>
            <Badge bg="info" className="badge-modern p-2">
              <span className="fw-bold">Total Protein:</span> {totalProtein}g
            </Badge>
          </div>
          
          <Table hover responsive className="modern-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Meal</th>
                <th>Type</th>
                <th>Calories</th>
                <th>Protein</th>
                <th>Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((meal, index) => (
                <motion.tr 
                  key={meal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(102, 126, 234, 0.05)' }}
                >
                  <td className="fw-semibold">🕗 {meal.time}</td>
                  <td>
                    {meal.name}
                    {meal.source === 'ai' && (
                      <Badge bg="success" className="ms-2 badge-modern" style={{ fontSize: '0.6em' }}>
                        AI
                      </Badge>
                    )}
                  </td>
                  <td>
                    <Badge className="badge-modern" bg={
                      meal.type === 'Breakfast' ? 'success' :
                      meal.type === 'Lunch' ? 'primary' :
                      meal.type === 'Dinner' ? 'warning' : 'info'
                    }>
                      {meal.type}
                    </Badge>
                  </td>
                  <td>
                    <Badge className="badge-modern" bg="warning">
                      {meal.calories}
                    </Badge>
                  </td>
                  <td>
                    <Badge className="badge-modern" bg="info">
                      {meal.protein}g
                    </Badge>
                  </td>
                  <td>
                    {meal.source === 'ai' ? (
                      <span className="text-success">🤖 AI</span>
                    ) : (
                      <span className="text-muted">✏️ Manual</span>
                    )}
                  </td>
                  <td>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => deleteMeal(meal.id)}
                        className="btn-modern"
                      >
                        Delete
                      </Button>
                    </motion.div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-gradient">➕ Add New Meal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="form-modern p-3">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Meal Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g., Protein Shake"
                value={newMeal.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeal({...newMeal, name: e.target.value})}
                className="form-modern-control"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Meal Type</Form.Label>
              <Form.Select 
                value={newMeal.type}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewMeal({...newMeal, type: e.target.value})}
                className="form-modern-control"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snack</option>
              </Form.Select>
            </Form.Group>
            
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Calories</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="250"
                    value={newMeal.calories}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeal({...newMeal, calories: e.target.value})}
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Protein (g)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="25"
                    value={newMeal.protein}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeal({...newMeal, protein: e.target.value})}
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Carbs (g)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="30"
                    value={newMeal.carbs}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeal({...newMeal, carbs: e.target.value})}
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Fat (g)</Form.Label>
                  <Form.Control 
                    type="number" 
                    placeholder="10"
                    value={newMeal.fat}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeal({...newMeal, fat: e.target.value})}
                    className="form-modern-control"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="secondary" 
              onClick={() => setShowAddModal(false)}
              className="btn-modern"
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="primary" 
              onClick={addMeal}
              className="btn-modern btn-primary-modern"
            >
              Add Meal
            </Button>
          </motion.div>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}