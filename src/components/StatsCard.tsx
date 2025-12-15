import { Card, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string;
  progress: number;
  color: string;
  icon: string;
  subtitle?: string;
  gradient?: string;
}

export default function StatsCard({ title, value, progress, icon, subtitle, gradient }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="stat-card h-100">
        <Card.Body className="p-4">
          <div className="d-flex align-items-start justify-content-between mb-3">
            <div className="stat-icon" style={{ background: gradient }}>
              {icon}
            </div>
            <div className="text-end">
              <div className="text-muted small fw-semibold">{title}</div>
              <h3 className="fw-bold mb-0 display-6 text-light">{value}</h3>
            </div>
          </div>
          
          {subtitle && (
            <div className="text-muted small mb-2 fw-medium">{subtitle}</div>
          )}
          
          <div className="d-flex align-items-center justify-content-between">
            <div className="w-100 me-3">
              <div className="progress custom-progress">
                <motion.div 
                  className="custom-progress-bar"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  style={{ background: gradient }}
                />
              </div>
            </div>
            <div className="fw-bold text-gradient" style={{ minWidth: '40px', fontSize: '1.1rem' }}>
              {progress}%
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}