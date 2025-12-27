
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface EncouragementToastProps {
  message: string | null;
  onClear: () => void;
}

const MotionDiv = motion.div as any;

const EncouragementToast: React.FC<EncouragementToastProps> = ({ message, onClear }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClear, 2500);
      return () => clearTimeout(timer);
    }
  }, [message, onClear]);

  return (
    <AnimatePresence>
      {message && (
        <MotionDiv 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="fixed bottom-24 left-0 right-0 z-40 flex justify-center pointer-events-none px-4"
        >
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-xl shadow-indigo-500/30 flex items-center gap-3 border-2 border-indigo-400">
            <Sparkles size={20} className="text-yellow-300 fill-yellow-300 animate-pulse" />
            <span className="font-black text-lg tracking-wide">{message}</span>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default EncouragementToast;
