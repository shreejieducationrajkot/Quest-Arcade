
// Removed import { Variants } from 'framer-motion';

export const popIn = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 15 }
  },
  exit: { scale: 0, opacity: 0 }
};

export const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
  exit: { y: -50, opacity: 0 }
};

export const pulse = {
  idle: { scale: 1 },
  pulse: { 
    scale: 1.1,
    transition: { repeat: Infinity, duration: 0.8, repeatType: 'reverse' }
  }
};
