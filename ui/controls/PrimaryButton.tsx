
import React from 'react';
import { motion } from 'framer-motion';
import { useSound } from '../../games/components/SoundManager';

interface PrimaryButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'danger';
}

const MotionButton = motion.button as any;

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  onClick, 
  children, 
  disabled = false, 
  className = '',
  variant = 'primary'
}) => {
  const { playSound } = useSound();

  const handleClick = () => {
    if (!disabled) {
      playSound('click');
      onClick();
    }
  };

  const getVariantClasses = () => {
    switch(variant) {
      case 'success': 
        return 'bg-green-500 hover:bg-green-400 text-white shadow-[0_4px_0_rgb(21,128,61)] active:shadow-[0_0px_0_rgb(21,128,61)]';
      case 'warning': 
        return 'bg-amber-400 hover:bg-amber-300 text-amber-900 shadow-[0_4px_0_rgb(180,83,9)] active:shadow-[0_0px_0_rgb(180,83,9)]';
      case 'danger': 
        return 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_4px_0_rgb(190,18,60)] active:shadow-[0_0px_0_rgb(190,18,60)]';
      case 'neutral': 
        return 'bg-slate-200 hover:bg-slate-100 text-slate-700 shadow-[0_4px_0_rgb(148,163,184)] active:shadow-[0_0px_0_rgb(148,163,184)]';
      default: // primary
        return 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_4px_0_rgb(67,56,202)] active:shadow-[0_0px_0_rgb(67,56,202)]';
    }
  };

  return (
    <MotionButton
      whileTap={!disabled ? { y: 4 } : {}}
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative px-6 py-3 rounded-2xl font-black text-lg tracking-wide
        transition-all duration-100 flex items-center justify-center gap-2 select-none
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-1
        ${getVariantClasses()}
        ${className}
      `}
    >
      {children}
    </MotionButton>
  );
};

export default PrimaryButton;
