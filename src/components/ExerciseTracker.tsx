import { Card, Table, Button, Badge, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { sampleExercises } from '../data/sampleData';

export default function ExerciseTracker() {
  const totalCalories = sampleExercises.reduce((sum, ex) => sum + ex.calories, 0);
  const totalDuration = sampleExercises.reduce((sum, ex) => sum + parseInt(ex.duration), 0);

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="stat-card h-100">
        <Card.Header className="border-0 bg-transparent">
          <Card.Title className="mb-0 fw-bold">💪 Today's Exercises</Card.Title>
          <small className="text-muted">Track your workout activities</small>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="border-0" style={{ 
                  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
                  borderRadius: '15px'
                }}>
                  <Card.Body className="text-center py-3">
                    <div className="fw-bold mb-1" style={{ color: 'var(--accent-blue)' }}>🔥 Calories Burned</div>
                    <h3 className="fw-bold mb-0 text-gradient">{totalCalories}</h3>
                    <small className="text-muted">Total today</small>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
            <Col md={6}>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Card className="border-0" style={{ 
                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(0, 188, 212, 0.1) 100%)',
                  borderRadius: '15px'
                }}>
                  <Card.Body className="text-center py-3">
                    <div className="fw-bold mb-1" style={{ color: 'var(--accent-teal)' }}>⏱️ Total Duration</div>
                    <h3 className="fw-bold mb-0 text-gradient">{totalDuration} min</h3>
                    <small className="text-muted">Active time</small>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
          
          <Table hover size="sm" className="modern-table mb-4">
            <thead>
              <tr>
                <th>Exercise</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Calories</th>
              </tr>
            </thead>
            <tbody>
              {sampleExercises.map((exercise, index) => (
                <motion.tr 
                  key={exercise.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(25, 118, 210, 0.05)' }}
                >
                  <td className="fw-semibold">{exercise.name}</td>
                  <td>
                    <Badge className="badge-modern" bg={
                      exercise.type === 'Cardio' ? 'danger' : 
                      exercise.type === 'Strength' ? 'primary' : 'success'
                    }>
                      {exercise.type}
                    </Badge>
                  </td>
                  <td>{exercise.duration}</td>
                  <td>
                    <Badge className="badge-modern" bg="warning">
                      {exercise.calories}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </Table>
          
          <div className="d-flex gap-2 justify-content-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="success" className="btn-modern btn-success-modern">
                + Add Exercise
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline-secondary" className="btn-modern">
                View All
              </Button>
            </motion.div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}