
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface XPAnimationProps {
  amount: number;
  show: boolean;
  x?: number;
  y?: number;
}

const MotionDiv = motion.div as any;

const XPAnimation: React.FC<XPAnimationProps> = ({ amount, show, x = 50, y = 50 }) => {
  return (
    <AnimatePresence>
      {show && (
        <MotionDiv 
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -80, scale: 1.2 }}
          exit={{ opacity: 0 }}
          style={{ left: `${x}%`, top: `${y}%` }}
          className="fixed pointer-events-none z-[60] font-black text-4xl text-yellow-400 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]"
        >
          +{amount} XP
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default XPAnimation;
