
import React from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../controls/PrimaryButton';
import { Star, RotateCcw, ArrowRight } from 'lucide-react';

interface ResultModalProps {
  score: number;
  correctCount: number;
  totalQuestions: number;
  onReplay: () => void;
  onNext: () => void;
}

const MotionDiv = motion.div as any;

const ResultModal: React.FC<ResultModalProps> = ({ score, correctCount, totalQuestions, onReplay, onNext }) => {
  const percentage = Math.round((correctCount / totalQuestions) * 100) || 0;
  const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"></div>

      <MotionDiv 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative"
      >
        {/* Header */}
        <div className="bg-indigo-600 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <h2 className="text-3xl font-black text-white relative z-10 mb-6 tracking-wide uppercase">Level Complete!</h2>
          
          <div className="flex justify-center gap-4 relative z-10">
            {[1, 2, 3].map((star) => (
              <MotionDiv
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: star * 0.2, type: 'spring' }}
              >
                <Star 
                  size={48} 
                  className={star <= stars ? "text-yellow-400 fill-yellow-400 drop-shadow-md" : "text-indigo-800 fill-indigo-900"} 
                  strokeWidth={3}
                />
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl text-center border-2 border-slate-100 shadow-sm">
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Score</div>
              <div className="text-3xl font-black text-indigo-600">{score}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl text-center border-2 border-slate-100 shadow-sm">
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Accuracy</div>
              <div className="text-3xl font-black text-emerald-500">{correctCount}/{totalQuestions}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <PrimaryButton onClick={onReplay} variant="neutral" className="flex-1">
              <RotateCcw size={20} /> Replay
            </PrimaryButton>
            <PrimaryButton onClick={onNext} className="flex-1">
              Next <ArrowRight size={20} />
            </PrimaryButton>
          </div>
        </div>
      </MotionDiv>
    </div>
  );
};

export default ResultModal;
