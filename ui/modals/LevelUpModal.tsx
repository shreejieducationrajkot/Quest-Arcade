
import React from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../controls/PrimaryButton';

interface LevelUpModalProps {
  newLevel: number;
  onClose: () => void;
}

const MotionDiv = motion.div as any;

const LevelUpModal: React.FC<LevelUpModalProps> = ({ newLevel, onClose }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"></div>
      
      <MotionDiv 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center relative z-10 w-full max-w-md"
      >
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/30 rounded-full blur-3xl animate-pulse"></div>
        
        <h2 className="text-6xl font-black text-white mb-8 drop-shadow-lg italic tracking-tighter">LEVEL UP!</h2>
        
        <div className="bg-gradient-to-br from-yellow-300 to-orange-500 w-40 h-40 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl border-[6px] border-white mb-10 transform -rotate-6">
          <span className="text-8xl font-black text-white drop-shadow-md">{newLevel}</span>
        </div>

        <PrimaryButton onClick={onClose} className="mx-auto min-w-[200px] text-xl shadow-xl shadow-indigo-900/50">
          CONTINUE
        </PrimaryButton>
      </MotionDiv>
    </div>
  );
};

export default LevelUpModal;
