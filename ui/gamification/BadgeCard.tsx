
import React from 'react';
import { motion } from 'framer-motion';

interface BadgeCardProps {
  icon: string;
  name: string;
  description: string;
  isLocked?: boolean;
}

const MotionDiv = motion.div as any;

const BadgeCard: React.FC<BadgeCardProps> = ({ icon, name, description, isLocked = false }) => {
  return (
    <MotionDiv 
      whileHover={{ y: -5 }}
      className={`
        relative p-6 rounded-3xl border-2 flex flex-col items-center text-center transition-all duration-300
        ${isLocked 
          ? 'bg-slate-100 border-slate-200 grayscale opacity-70' 
          : 'bg-white border-indigo-100 shadow-xl shadow-indigo-100 hover:shadow-2xl hover:border-indigo-200'}
      `}
    >
      <div className="text-5xl mb-3 filter drop-shadow-md">{icon}</div>
      <h3 className="font-black text-slate-800 text-base mb-1">{name}</h3>
      <p className="text-xs font-medium text-slate-500 leading-relaxed">{description}</p>
      
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/40 rounded-3xl backdrop-blur-[1px]">
          <span className="bg-slate-700 text-white text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-black shadow-lg">Locked</span>
        </div>
      )}
    </MotionDiv>
  );
};

export default BadgeCard;
