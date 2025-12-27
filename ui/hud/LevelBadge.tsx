
import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface LevelBadgeProps {
  level: number;
}

const MotionDiv = motion.div as any;

const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
  return (
    <MotionDiv 
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="relative w-14 h-14 flex items-center justify-center select-none"
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-yellow-500 rounded-full blur-md opacity-50"></div>
      
      {/* Badge Body */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
        <div className="flex flex-col items-center leading-none -mt-1">
          <span className="text-[10px] font-black text-amber-900 uppercase">Lvl</span>
          <span className="text-xl font-black text-amber-900">{level}</span>
        </div>
      </div>

      {/* Decorative Star */}
      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
        <Star size={14} className="text-amber-500 fill-amber-500" />
      </div>
    </MotionDiv>
  );
};

export default LevelBadge;
