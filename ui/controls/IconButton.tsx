
import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../games/components/SoundManager';

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  className?: string;
  label?: string;
}

const MotionButton = motion.button as any;

const IconButton: React.FC<IconButtonProps> = ({ onClick, icon, className = '', label }) => {
  const { playSound } = useSound();

  const handleClick = () => {
    playSound('click');
    onClick();
  };

  return (
    <MotionButton
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      aria-label={label}
      className={`
        p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800/60 backdrop-blur-md
        border-2 border-white/10 text-white shadow-lg transition-colors
        flex items-center justify-center active:scale-95
        ${className}
      `}
    >
      {icon}
    </MotionButton>
  );
};

export default IconButton;
