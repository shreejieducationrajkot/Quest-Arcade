import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { Trophy, Zap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

// --- Types ---
interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  isPaused: boolean;
}

// --- Game Component ---
const PenaltyKickGameComponent: React.FC<MiniGameProps> = ({ question, onAnswer, isPaused }) => {
  const [kickState, setKickState] = useState<'idle' | 'run' | 'kick' | 'celebrate' | 'sad'>('idle');
  const [goalieState, setGoalieState] = useState<'idle' | 'dive-left' | 'dive-right'>('idle');
  const [ballState, setBallState] = useState<{ x: number, y: number, scale: number, rotate: number }>({ x: 0, y: 0, scale: 1, rotate: 0 });
  const [feedback, setFeedback] = useState<'goal' | 'saved' | null>(null);
  const [gameActive, setGameActive] = useState(true);

  const handleKick = (index: number) => {
    if (!gameActive || isPaused) return;
    setGameActive(false);

    // 1. Kick Animation
    setKickState('run');
    setTimeout(() => setKickState('kick'), 300);

    const isCorrect = index === question.correctAnswer;
    
    // Targets relative to ball center
    const targets = [
        { x: -120, y: -100 }, { x: 120, y: -100 },
        { x: -120, y: -20 },  { x: 120, y: -20 }
    ];
    const targetPos = targets[index % 4];

    // 2. Ball Animation
    setTimeout(() => {
        setBallState({
            x: targetPos.x,
            y: targetPos.y,
            scale: 0.6,
            rotate: 720
        });

        // 3. Goalie Logic
        if (isCorrect) {
            // Goalie dives WRONG way
            const wrongDive = (index % 2 === 0) ? 'dive-right' : 'dive-left';
            setGoalieState(wrongDive);
            
            setTimeout(() => {
                setFeedback('goal');
                setKickState('celebrate');
                setTimeout(() => onAnswer(index, true), 1500);
            }, 600);
        } else {
            // Goalie dives TO ball
            const correctDive = (index % 2 === 0) ? 'dive-left' : 'dive-right';
            setGoalieState(correctDive);
            
            setTimeout(() => {
                setFeedback('saved');
                setKickState('sad');
                // Bounce ball back
                setBallState(prev => ({ ...prev, y: prev.y + 50, scale: 0.7 }));
                setTimeout(() => onAnswer(index, false), 1500);
            }, 600);
        }

    }, 300);
  };

  return (
    <div className="relative w-full h-[600px] bg-green-600 overflow-hidden font-sans select-none flex flex-col rounded-3xl border-4 border-slate-800 shadow-2xl">
        
        {/* Stadium Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100 h-1/2 z-0">
             <div className="absolute bottom-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
        </div>

        {/* Field */}
        <div className="absolute bottom-0 w-full h-1/2 bg-green-600 z-0" style={{ perspective: '800px' }}>
             <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_49px,#ffffff20_50px)] transform rotateX(45deg) scale(1.5) origin-top"></div>
        </div>

        {/* GOAL POST AREA */}
        <div className="relative flex-1 flex items-end justify-center z-10 pb-20">
             <div className="relative w-[300px] md:w-[500px] h-[180px] md:h-[250px] border-8 border-white border-b-0 flex items-end justify-center bg-black/10 backdrop-blur-sm">
                 {/* Net */}
                 <div className="absolute inset-0 z-[-1] opacity-20 bg-[repeating-linear-gradient(45deg,#fff_0px,#fff_1px,transparent_1px,transparent_10px),repeating-linear-gradient(-45deg,#fff_0px,#fff_1px,transparent_1px,transparent_10px)]"></div>
                 
                 {/* Goalie */}
                 <motion.div 
                    className="text-6xl md:text-8xl absolute bottom-0"
                    animate={
                        goalieState === 'dive-left' ? { x: -150, rotate: -45, y: 50 } :
                        goalieState === 'dive-right' ? { x: 150, rotate: 45, y: 50 } :
                        { y: [0, -5, 0] }
                    }
                    transition={{ duration: 0.5 }}
                 >
                     🧤🥅
                 </motion.div>

                 {/* Targets */}
                 {question.options.map((opt, idx) => (
                     <motion.button
                        key={idx}
                        onClick={() => handleKick(idx)}
                        disabled={!gameActive || isPaused}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={gameActive && !isPaused ? { scale: 1.05 } : {}}
                        className={`
                           absolute w-24 md:w-32 h-16 bg-white/90 backdrop-blur rounded-lg border-2 shadow-lg flex flex-col items-center justify-center p-1 cursor-pointer
                           ${idx === 0 ? 'top-2 left-2 border-red-500' : 
                             idx === 1 ? 'top-2 right-2 border-blue-500' :
                             idx === 2 ? 'bottom-2 left-2 border-yellow-500' : 
                             'bottom-2 right-2 border-green-500'}
                        `}
                     >
                         <div className="text-[10px] font-bold text-slate-500">{String.fromCharCode(65+idx)}</div>
                         <span className="text-slate-900 font-bold text-xs leading-tight text-center line-clamp-2">{opt}</span>
                     </motion.button>
                 ))}
             </div>
        </div>

        {/* Question Banner */}
        <div className="absolute top-4 left-4 right-4 z-40 flex justify-center pointer-events-none">
             <div className="bg-white/95 backdrop-blur-md px-6 py-2 rounded-xl shadow-lg border-2 border-slate-200 text-center">
                 <h2 className="text-sm md:text-lg font-black text-slate-800">{question.text}</h2>
             </div>
        </div>

        {/* PLAYER & BALL LAYER */}
        <div className="absolute bottom-4 left-0 right-0 h-32 flex justify-center items-end z-30">
             <div className="relative">
                 {/* Player Emoji */}
                 <motion.div 
                    className="absolute bottom-8 -left-12 text-6xl md:text-7xl"
                    animate={
                        kickState === 'run' ? { x: 40 } :
                        kickState === 'kick' ? { x: 60, rotate: 20 } :
                        kickState === 'celebrate' ? { y: -30, rotate: [0, -10, 10, 0] } :
                        kickState === 'sad' ? { rotate: 10, filter: 'grayscale(1)' } :
                        { x: 0 }
                    }
                    transition={{ duration: 0.3 }}
                 >
                     🏃
                 </motion.div>

                 {/* Ball */}
                 <motion.div 
                    className="text-4xl md:text-5xl relative z-20"
                    animate={ballState}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                 >
                     ⚽
                 </motion.div>
             </div>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
            {feedback === 'goal' && (
                <motion.div 
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   exit={{ scale: 0 }}
                   className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                    <div className="bg-yellow-400 text-yellow-900 font-black text-6xl px-8 py-4 rounded-3xl border-4 border-white shadow-xl transform -rotate-6">
                        GOAL!
                    </div>
                </motion.div>
            )}
            {feedback === 'saved' && (
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                    <div className="bg-red-600 text-white font-black text-5xl px-8 py-4 rounded-3xl shadow-xl border-4 border-red-800">
                        SAVED!
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

    </div>
  );
};

// --- Main Wrapper ---
interface PenaltyKickProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const PenaltyKick: React.FC<PenaltyKickProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5));
    }
  }, [student, customQuestions]);

  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    if (isGameOver || isPaused) return;

    if (isCorrect) {
      const streakBonus = streak * 50;
      setScore(prev => prev + 100 + streakBonus);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
       if (currentQIndex + 1 >= questions.length) {
           setIsGameOver(true);
           setTimeout(() => {
             onGameOver({
                 score,
                 streak,
                 questionsAnswered: questions.length,
                 correctAnswers,
                 timeElapsed: (Date.now() - startTime) / 1000,
                 level: 1
             });
           }, 1000);
       } else {
           setCurrentQIndex(prev => (prev + 1) % questions.length);
       }
    }, 2000); 
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentQIndex(0);
    setCorrectAnswers(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  if (questions.length === 0) return <div className="text-white text-center p-10">Loading Arena...</div>;

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col font-sans">
       <PauseMenu 
         onPause={() => setIsPaused(true)}
         onResume={() => setIsPaused(false)}
         onRestart={handleRestart}
         onQuit={onExit || (() => {})}
       />

       {/* HUD */}
       <div className="bg-slate-800 p-4 shadow-lg z-10 flex justify-between items-center text-white border-b-4 border-slate-700">
           <div className="ml-12 flex gap-6">
               <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-700">
                   <Trophy className="w-6 h-6 text-yellow-400" />
                   <motion.span 
                     key={score}
                     initial={{ scale: 1.5, color: '#facc15' }}
                     animate={{ scale: 1, color: '#ffffff' }}
                     className="font-black text-xl"
                   >
                     {score}
                   </motion.span>
               </div>
           </div>

           <div className="flex items-center gap-2">
               {streak > 1 && (
                   <motion.div 
                     key={streak}
                     initial={{ scale: 1.5 }}
                     animate={{ scale: 1 }}
                     className="flex items-center gap-1 text-orange-400 font-black animate-bounce"
                   >
                       <Zap fill="currentColor" /> {streak}x Streak
                   </motion.div>
               )}
           </div>
       </div>

       {/* Game Container */}
       <div className="flex-1 relative overflow-hidden p-4 flex items-center justify-center">
           {isGameOver ? (
               <div className="text-4xl font-black text-white animate-pulse">GAME OVER</div>
           ) : (
               <div className="w-full max-w-5xl h-full">
                   <PenaltyKickGameComponent 
                      key={currentQIndex} 
                      question={currentQuestion} 
                      onAnswer={handleAnswer}
                      isPaused={isPaused}
                   />
               </div>
           )}
       </div>
    </div>
  );
};

export default PenaltyKick;