
import React from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../controls/PrimaryButton';
import { Play, Home, RefreshCw } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

const MotionDiv = motion.div as any;

const PauseModal: React.FC<PauseModalProps> = ({ isOpen, onResume, onRestart, onQuit }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>
      
      <MotionDiv 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center relative border-4 border-indigo-50"
      >
        <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Paused</h2>
        <p className="text-slate-500 mb-8 font-bold text-sm">Take a breath, you're doing great!</p>

        <div className="space-y-4">
          <PrimaryButton onClick={onResume} className="w-full">
            <Play size={20} fill="currentColor" /> Resume Game
          </PrimaryButton>
          
          <PrimaryButton onClick={onRestart} variant="warning" className="w-full">
            <RefreshCw size={20} /> Restart Level
          </PrimaryButton>

          <PrimaryButton onClick={onQuit} variant="neutral" className="w-full">
            <Home size={20} /> Quit to Menu
          </PrimaryButton>
        </div>
      </MotionDiv>
    </div>
  );
};

export default PauseModal;
