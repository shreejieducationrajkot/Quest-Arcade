
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Stars } from 'lucide-react';

interface CorrectAnswerProps {
  show: boolean;
  message?: string;
}

const MotionDiv = motion.div as any;

const CorrectAnswer: React.FC<CorrectAnswerProps> = ({ show, message = "Awesome!" }) => {
  return (
    <AnimatePresence>
      {show && (
        <MotionDiv 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm"></div>

          {/* Card */}
          <MotionDiv 
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -100, opacity: 0 }}
            className="bg-white relative p-10 rounded-[2rem] shadow-2xl flex flex-col items-center border-b-8 border-green-200 text-center max-w-sm w-full mx-auto"
          >
            <div className="absolute -top-10 bg-green-500 p-4 rounded-full border-8 border-white shadow-lg">
               <CheckCircle size={64} className="text-white" strokeWidth={3} />
            </div>
            
            <div className="mt-8 space-y-2">
              <h2 className="text-4xl font-black text-green-500 font-comic tracking-wide uppercase">{message}</h2>
              <div className="flex justify-center gap-2 text-yellow-400">
                 <Stars size={24} className="fill-current animate-spin-slow" />
                 <Stars size={24} className="fill-current animate-bounce" />
                 <Stars size={24} className="fill-current animate-spin-slow" />
              </div>
            </div>
          </MotionDiv>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default CorrectAnswer;
