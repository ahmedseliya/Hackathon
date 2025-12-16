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
  const [activeTab, setActiveTab] = useState('home');
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref);

  // Create refs for smooth scrolling
  const homeSectionRef = useRef<HTMLDivElement>(null);
  const mealSectionRef = useRef<HTMLDivElement>(null);
  const exerciseSectionRef = useRef<HTMLDivElement>(null);
  const bmiSectionRef = useRef<HTMLDivElement>(null);

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

  // Smooth scroll function
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement | null>) => {
    if (sectionRef.current) {
      const offset = 80; // Adjust based on your navbar height
      const elementPosition = sectionRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Handle navigation click
  const handleNavClick = (item: string) => {
    setActiveTab(item.toLowerCase());
    
    switch(item.toLowerCase()) {
      case 'home':
        scrollToSection(homeSectionRef);
        break;
      case 'dashboard':
        scrollToSection(exerciseSectionRef);
        break;
      case 'nutrition':
        scrollToSection(mealSectionRef);
        break;
      case 'workouts':
        scrollToSection(exerciseSectionRef);
        break;
      case 'bmi calculator':
        scrollToSection(bmiSectionRef);
        break;
      default:
        // For logout, scroll to top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
    }
  };

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
      <Navbar expand="lg" className="navbar-glass" fixed="top">
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
            <Nav className="mx-auto me-lg-5">
              {['Home', 'Dashboard','BMI Calculator', 'Nutrition','Workouts', 'Logout'].map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Nav.Link 
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className={`mx-1 fw-semibold ${activeTab === item.toLowerCase() ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item);
                    }}
                  >
                    {item}
                  </Nav.Link>
                </motion.div>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content - Add padding top to account for fixed navbar */}
      <div className="dashboard-content" ref={ref} style={{ paddingTop: '80px' }}>
        {/* Welcome Header with ref for Home navigation */}
        <div ref={homeSectionRef}>
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
                </Row>
              </Card.Body>
            </Card>
          </motion.div>
        </div>

        {/* MAIN LAYOUT - CORRECT POSITIONING */}
        <div className="main-layout">
          {/* Left Column - Meal Tracker */}
          <div ref={mealSectionRef} className="meal-tracker-container">
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="section-header">
                <h3 className="fw-bold mb-4">🍎 Nutrition Tracker</h3>
              </div>
              <MealTracker />
            </motion.div>
          </div>

          {/* Right Column - BMI & Exercise */}
          <div className="sidebar-column">
            {/* BMI Calculator with ref for scrolling */}
            <div ref={bmiSectionRef} className="bmi-calculator">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="section-header">
                  <h3 className="fw-bold mb-4">⚖️ BMI Calculator</h3>
                </div>
                <BMICalculator />
              </motion.div>
            </div>
            
            {/* Exercise Tracker with ref for scrolling */}
            <div ref={exerciseSectionRef} className="exercise-tracker">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="section-header">
                  <h3 className="fw-bold mb-4">💪 Exercise Tracker</h3>
                </div>
                <ExerciseTracker />
              </motion.div>
            </div>
          </div>
        </div>
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