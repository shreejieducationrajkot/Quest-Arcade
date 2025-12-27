
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface AchievementPopupProps {
  title: string;
  visible: boolean;
}

const MotionDiv = motion.div as any;

const AchievementPopup: React.FC<AchievementPopupProps> = ({ title, visible }) => {
  return (
    <AnimatePresence>
      {visible && (
        <MotionDiv 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[120] bg-white rounded-full shadow-2xl p-2 pr-8 flex items-center gap-4 border-4 border-yellow-400"
        >
          <div className="bg-yellow-400 p-3 rounded-full text-white shadow-inner">
            <Trophy size={24} fill="currentColor" />
          </div>
          <div>
            <div className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">Achievement Unlocked</div>
            <div className="text-base font-bold text-slate-800">{title}</div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
};

export default AchievementPopup;
