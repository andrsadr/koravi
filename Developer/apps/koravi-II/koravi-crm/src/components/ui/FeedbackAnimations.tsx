'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Info, Trash2, Save, Plus } from 'lucide-react';
import { ReactNode } from 'react';

interface FeedbackAnimationProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'delete' | 'save' | 'create';
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
  duration?: number;
}

const iconMap = {
  success: Check,
  error: X,
  warning: AlertCircle,
  info: Info,
  delete: Trash2,
  save: Save,
  create: Plus,
};

const colorMap = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-blue-500 text-white',
  delete: 'bg-red-500 text-white',
  save: 'bg-green-500 text-white',
  create: 'bg-blue-500 text-white',
};

export function FeedbackAnimation({ 
  type, 
  message, 
  isVisible, 
  onComplete, 
  duration = 3000 
}: FeedbackAnimationProps) {
  const Icon = iconMap[type];

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${colorMap[type]}`}
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon className="w-5 h-5" />
          </motion.div>
          <span className="font-medium">{message}</span>
          
          {/* Progress bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: duration / 1000, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating action feedback for buttons
interface FloatingActionFeedbackProps {
  children: ReactNode;
  action: 'save' | 'delete' | 'create' | 'update';
  isActive: boolean;
}

export function FloatingActionFeedback({ 
  children, 
  action, 
  isActive 
}: FloatingActionFeedbackProps) {
  const actionConfig = {
    save: { color: 'bg-green-500', icon: Save, message: 'Saved!' },
    delete: { color: 'bg-red-500', icon: Trash2, message: 'Deleted!' },
    create: { color: 'bg-blue-500', icon: Plus, message: 'Created!' },
    update: { color: 'bg-amber-500', icon: Check, message: 'Updated!' },
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={`absolute -top-12 left-1/2 -translate-x-1/2 ${config.color} text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap`}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{config.message}</span>
            
            {/* Arrow pointing down */}
            <div 
              className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${config.color.replace('bg-', 'border-t-')}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Ripple effect for clickable elements
interface RippleEffectProps {
  children: ReactNode;
  className?: string;
}

export function RippleEffect({ children, className }: RippleEffectProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{
        // Add ripple animation keyframes
        // This would normally be in CSS, but we'll add it inline for simplicity
      }}
    >
      {children}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}