
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface WrongAnswerProps {
  show: boolean;
  message?: string;
}

const MotionDiv = motion.div as any;

const WrongAnswer: React.FC<WrongAnswerProps> = ({ show, message = "Oops, try again!" }) => {
  return (
    <AnimatePresence>
      {show && (
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
        >
          <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm"></div>

          <MotionDiv 
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            className="bg-white relative p-8 rounded-[2rem] shadow-2xl flex flex-col items-center border-b-8 border-amber-200 text-center max-w-sm w-full"
          >
            <div className="absolute -top-8 bg-amber-400 p-4 rounded-full border-8 border-white shadow-lg">
               <HelpCircle size={48} className="text-white" strokeWidth={3} />
            </div>
            
            <div className="mt-6">
              <h2 className="text-3xl font-black text-amber-500 font-comic mb-2">{message}</h2>
              <p className="text-slate-400 font-bold text-sm">Don't worry, mistakes help us learn!</p>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default WrongAnswer;
