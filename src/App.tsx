import { Container, Row, Col, Navbar, Nav, Button, Card, Badge } from 'react-bootstrap';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import type { Variants } from 'framer-motion';
import './App.css';
import './index.css';
import BMICalculator from './components/BMICalculator';
import MealTracker from './components/MealTracker';
import ExerciseTracker from './components/ExerciseTracker';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  
  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="animated-background">
        <div className="background-glow"></div>
        <div className="floating-dots"></div>
      </div>

      {/* Floating Glow Orbs */}
      <motion.div
        className="position-fixed"
        style={{
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(58, 134, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: -1
        }}
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="position-fixed"
        style={{
          bottom: '30%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0, 255, 157, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: -1
        }}
        animate={{
          y: [0, 20, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      {/* Navigation */}
      <Navbar expand="lg" className="navbar-glass">
        <Container fluid>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Navbar.Brand href="#" className="nav-brand">
              <span className="me-2">🏋️‍♂️</span> FitnessPro
              <Badge bg="primary" className="ms-2 badge-modern pulse">2025</Badge>
            </Navbar.Brand>
          </motion.div>
          
          <Navbar.Toggle aria-controls="navbar" />
          <Navbar.Collapse id="navbar">
            <Nav className="mx-auto">
              {['Dashboard', 'Workouts', 'Nutrition', 'Progress', 'Community'].map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Nav.Link 
                    href={`#${item.toLowerCase()}`}
                    className={`mx-1 fw-semibold ${activeTab === item.toLowerCase() ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.toLowerCase())}
                  >
                    {item}
                  </Nav.Link>
                </motion.div>
              ))}
            </Nav>
            
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="d-flex align-items-center"
            >
              <Button variant="outline-primary" className="btn-modern me-2">
                🔔 Notifications
              </Button>
              <Button variant="primary" className="btn-modern btn-primary-modern">
                👤 Profile
              </Button>
            </motion.div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content - FIXED POSITIONING */}
      <div className="dashboard-content" ref={ref}>
        {/* Welcome Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <Card className="welcome-card border-0">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <motion.h1 
                    className="display-5 fw-bold mb-3 text-gradient"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome Back, Champion! 🏆
                  </motion.h1>
                  <motion.p 
                    className="lead mb-0 text-muted"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    You're crushing your fitness goals. Keep up the amazing work!
                  </motion.p>
                </Col>
                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="d-flex flex-wrap justify-content-end gap-2"
                  >
                    <Button size="lg" className="btn-modern me-2">
                      ➕ Quick Log
                    </Button>
                    <Button size="lg" className="btn-modern btn-primary-modern">
                      📈 Analytics
                    </Button>
                  </motion.div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </motion.div>

        

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="quick-actions mb-4"
        >
          <h5 className="fw-bold mb-3">🚀 Quick Actions</h5>
          <div className="actions-grid">
            {[
              { label: "Log Meal", icon: "🍽️", color: "primary" },
              { label: "Start Workout", icon: "💪", color: "success" },
              { label: "Track Water", icon: "💧", color: "info" },
              { label: "Log Weight", icon: "⚖️", color: "warning" },
              { label: "View Progress", icon: "📈", color: "dark" }
            ].map((action, idx) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant={action.color as any} 
                  className={`btn-modern ${action.color === 'dark' ? '' : 'btn-' + action.color + '-modern'} w-100 d-flex align-items-center justify-content-center`}
                >
                  <span className="me-2 fs-5">{action.icon}</span> 
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MAIN LAYOUT - CORRECT POSITIONING */}
        <div className="main-layout">
          {/* Left Column - Meal Tracker */}
          <div className="meal-tracker-container">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <MealTracker />
            </motion.div>
          </div>

          {/* Right Column - BMI & Exercise - CORRECT POSITION */}
          <div className="sidebar-column">
            {/* BMI Calculator - FIXED POSITION */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bmi-calculator"
            >
              <BMICalculator />
            </motion.div>
            
            {/* Exercise Tracker - FIXED POSITION */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="exercise-tracker"
            >
              <ExerciseTracker />
            </motion.div>
          </div>
        </div>

        {/* Motivation Quote */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="motivation-card"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h4 className="fw-bold mb-3">💪 Today's Motivation</h4>
            <p className="lead mb-0 text-muted">
              "The only bad workout is the one that didn't happen. 
              Every rep brings you closer to your goals."
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="footer-modern"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.1 }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="fw-bold mb-3">
                <span className="me-2">🏋️‍♂️</span> FitnessPro 2025
              </h5>
              <p className="mb-0">
                Modern fitness tracking with beautiful UI and smooth animations.
              </p>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <div className="d-flex justify-content-md-end gap-3">
                <Button variant="outline-secondary" size="sm" className="btn-modern">
                  Privacy
                </Button>
                <Button variant="outline-secondary" size="sm" className="btn-modern">
                  Terms
                </Button>
                <Button variant="outline-secondary" size="sm" className="btn-modern">
                  Contact
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </motion.footer>
    </div>
  );
}

export default App;