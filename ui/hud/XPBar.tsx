
import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  current: number;
  max: number;
  level: number;
}

const MotionDiv = motion.div as any;

const XPBar: React.FC<XPBarProps> = ({ current, max, level }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));

  return (
    <div className="flex flex-col w-full min-w-[200px] max-w-xs">
      <div className="flex justify-between items-end mb-1 px-1">
        <span className="text-xs font-black text-white drop-shadow-md uppercase tracking-wider">Level {level}</span>
        <span className="text-xs font-bold text-white/80">{Math.floor(current)} / {max} XP</span>
      </div>
      
      <div className="h-5 bg-slate-900/60 backdrop-blur-sm rounded-full border-2 border-slate-700/50 p-[2px] relative overflow-hidden">
        <MotionDiv 
          className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full relative overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 15 }}
        >
          {/* Glossy highlight */}
          <div className="absolute top-0 left-0 right-0 h-[40%] bg-white/30 rounded-t-full"></div>
          
          {/* Striped pattern overlay if desired, or simple shimmer */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
        </MotionDiv>
      </div>
    </div>
  );
};

export default XPBar;
