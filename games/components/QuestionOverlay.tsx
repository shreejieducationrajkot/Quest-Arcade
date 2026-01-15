
import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Timer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './SoundManager';

interface QuestionOverlayProps {
  question: Question;
  onAnswer: (isCorrect: boolean, timeTaken: number) => void;
  streak: number;
}

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;
const MotionH2 = motion.h2 as any;

const QuestionOverlay: React.FC<QuestionOverlayProps> = ({ question, onAnswer, streak }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime] = useState(Date.now());
  const { playSound } = useSound();

  useEffect(() => {
    if (showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback]);

  const handleTimeUp = () => {
    playSound('wrong');
    setShowFeedback('wrong');
    setTimeout(() => {
      onAnswer(false, 60);
    }, 1500);
  };

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return; 

    setSelectedOption(index);
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = index === question.correctAnswer;

    playSound('click');
    setTimeout(() => {
        playSound(isCorrect ? 'correct' : 'wrong');
        setShowFeedback(isCorrect ? 'correct' : 'wrong');
    }, 200);

    setTimeout(() => {
      onAnswer(isCorrect, timeTaken);
    }, 1800);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <MotionDiv 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className={`
          relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border-4
          ${showFeedback === 'correct' ? 'border-green-500' : showFeedback === 'wrong' ? 'border-red-500' : 'border-indigo-600'}
        `}
      >
        {/* Header Bar */}
        <div className="bg-slate-50 p-3 md:p-4 flex justify-between items-center border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider truncate max-w-[120px] md:max-w-none">
              {question.subject}
            </span>
            {streak > 1 && (
              <MotionDiv 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 text-orange-500 font-bold text-sm"
              >
                <Zap size={14} fill="currentColor" />
                <span>{streak} Streak!</span>
              </MotionDiv>
            )}
          </div>
          <MotionDiv 
            animate={{ scale: timeLeft < 10 ? [1, 1.2, 1] : 1, color: timeLeft < 10 ? '#EF4444' : '#475569' }}
            transition={{ repeat: timeLeft < 10 ? Infinity : 0, duration: 0.5 }}
            className="flex items-center gap-2 font-mono font-bold text-lg md:text-xl text-slate-600"
          >
            <Timer size={20} />
            {timeLeft}s
          </MotionDiv>
        </div>

        {/* Question Body */}
        <div className="p-4 md:p-8 text-center max-h-[80vh] overflow-y-auto">
          <MotionH2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl md:text-3xl font-bold text-slate-800 mb-6 md:mb-8 leading-tight"
          >
            {question.text}
          </MotionH2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = idx === question.correctAnswer;
              
              let btnClass = "bg-white hover:bg-indigo-50 border-2 border-slate-200 text-slate-700";
              
              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  btnClass = "bg-green-500 border-green-600 text-white shadow-none translate-y-0";
                } else if (isSelected) {
                  btnClass = "bg-red-500 border-red-600 text-white shadow-none opacity-50";
                } else {
                  btnClass = "bg-slate-100 border-slate-200 text-slate-400 opacity-30";
                }
              }

              return (
                <MotionButton
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOption !== null}
                  whileHover={selectedOption === null ? { scale: 1.01, y: -2 } : {}}
                  whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                  animate={selectedOption !== null && isCorrectAnswer ? { scale: [1, 1.05, 1], transition: { repeat: 2 } } : {}}
                  className={`
                    p-4 md:p-6 rounded-xl text-base md:text-lg font-bold shadow-sm relative overflow-hidden
                    flex items-center justify-center transition-colors min-h-[60px] md:min-h-[80px]
                    ${btnClass}
                  `}
                >
                  {option}
                  {selectedOption !== null && isCorrectAnswer && (
                     <MotionDiv 
                       initial={{ scale: 0 }} 
                       animate={{ scale: 1 }}
                       className="absolute right-4 bg-white text-green-600 rounded-full p-1"
                     >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path></svg>
                     </MotionDiv>
                  )}
                </MotionButton>
              );
            })}
          </div>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {showFeedback && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               {/* Confetti / Particles for Correct */}
               {showFeedback === 'correct' && (
                  <div className="absolute inset-0 overflow-hidden">
                     {[...Array(20)].map((_, i) => (
                       <MotionDiv
                         key={i}
                         initial={{ y: -50, x: Math.random() * 600 - 300, rotate: 0 }}
                         animate={{ y: 500, rotate: 360 }}
                         transition={{ duration: 1.5, delay: Math.random() * 0.2 }}
                         className="absolute top-0 left-1/2 w-3 h-3 bg-yellow-400 rounded-sm"
                         style={{ backgroundColor: ['#FBBF24', '#34D399', '#60A5FA', '#F472B6'][i % 4] }}
                       />
                     ))}
                  </div>
               )}

               <MotionDiv 
                 initial={{ scale: 0, rotate: -10 }}
                 animate={{ scale: 1.5, rotate: 0 }}
                 exit={{ scale: 0 }}
                 className={`px-8 py-4 rounded-full text-4xl font-black text-white shadow-2xl z-10 ${showFeedback === 'correct' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-700'}`}
               >
                 {showFeedback === 'correct' ? 'AWESOME!' : 'OOPS!'}
               </MotionDiv>
            </div>
          )}
        </AnimatePresence>
      </MotionDiv>
    </div>
  );
};

export default QuestionOverlay;
