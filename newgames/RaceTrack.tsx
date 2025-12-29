
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from '../games/components/SoundManager';
import QuestionOverlay from '../games/components/QuestionOverlay';
import { Flag, Zap, Gauge, Flame, Trophy } from 'lucide-react';
import { PauseMenu } from '../games/components/PauseMenu';

interface RaceTrackProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const MotionDiv = motion.div as any;

// === CAR COMPONENT ===
const RaceCar = ({ color, isPlayer, label }: { color: string, isPlayer: boolean, label: string }) => {
  const darkColor = isPlayer ? '#1e3a8a' : '#7f1d1d';
  const bodyColor = color;

  return (
    <div className="relative flex flex-col items-center">
      <div className={`
        text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border whitespace-nowrap shadow-lg
        ${isPlayer ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'}
      `}>
        {label}
      </div>
      <svg viewBox="0 0 60 100" className="w-16 h-24 drop-shadow-2xl filter overflow-visible">
        <rect x="-6" y="12" width="12" height="18" fill="#1f2937" rx="3" />
        <rect x="54" y="12" width="12" height="18" fill="#1f2937" rx="3" />
        <rect x="-6" y="65" width="12" height="18" fill="#1f2937" rx="3" />
        <rect x="54" y="65" width="12" height="18" fill="#1f2937" rx="3" />
        <ellipse cx="30" cy="50" rx="40" ry="48" fill="black" fillOpacity="0.4" filter="blur(6px)" />
        <path d="M12,10 Q30,-5 48,10 L52,75 Q52,95 30,95 Q8,95 8,75 Z" fill={bodyColor} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <path d="M8,30 L2,30 L2,65 L8,65 Z" fill={darkColor} />
        <path d="M52,30 L58,30 L58,65 L52,65 Z" fill={darkColor} />
        <path d="M4,88 L56,88 L58,95 L2,95 Z" fill={darkColor} stroke="rgba(0,0,0,0.3)" />
        <path d="M15,35 L45,35 L42,55 Q30,60 18,55 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        <path d="M18,38 L42,38 L40,50 L20,50 Z" fill="#0f172a" opacity="0.6" />
        <rect x="28" y="10" width="4" height="80" fill="white" opacity="0.8" />
        {isPlayer && (
           <MotionDiv 
             className="absolute top-full left-1/2 -translate-x-1/2"
             animate={{ opacity: [0.6, 1, 0.6], scale: [0.9, 1.3, 0.9], y: [0, 5, 0] }}
             transition={{ repeat: Infinity, duration: 0.15 }}
           >
             <Flame size={24} className="text-orange-500 fill-yellow-400 rotate-180 drop-shadow-[0_0_10px_orange]" />
           </MotionDiv>
        )}
      </svg>
    </div>
  );
};

const RaceTrack: React.FC<RaceTrackProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [playerProgress, setPlayerProgress] = useState(0); // 0 to 1000m
  const [botProgress, setBotProgress] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [showQuestion, setShowQuestion] = useState(true);
  const [gameState, setGameState] = useState<'countdown' | 'racing' | 'finished'>('countdown');
  const [countdown, setCountdown] = useState(3);
  
  const [bgOffset, setBgOffset] = useState(0);
  const [startTime] = useState(Date.now());
  const [boostMode, setBoostMode] = useState(false);

  const { playSound } = useSound();

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [student, customQuestions]);

  useEffect(() => {
    if (questions.length > 0 && gameState === 'countdown' && !isPaused) {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev === 1) {
                    clearInterval(timer);
                    setGameState('racing');
                    playSound('shoot');
                    return 0;
                }
                playSound('click');
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [questions, gameState, playSound, isPaused]);

  useEffect(() => {
    if (gameState !== 'racing' || isPaused) return;

    const interval = setInterval(() => {
        setBgOffset(prev => prev + (speed * 0.8));
        setBotProgress(prev => Math.min(1000, prev + 1.5 + (Math.random() * 0.5)));
        if (!boostMode && speed > 50) {
            setSpeed(prev => Math.max(50, prev - 0.5));
        }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, speed, boostMode, playerProgress, botProgress, isPaused]);

  // Handle Player Progress Separately to check win condition inside interval
  useEffect(() => {
      if (gameState === 'racing' && !isPaused) {
          const interval = setInterval(() => {
             setPlayerProgress(prev => {
                 const newProgress = prev + (speed * 0.005);
                 if (newProgress >= 1000) {
                     // Check if state is already finished to avoid multiple calls
                     // But inside setter we can't see updated state easily without ref
                     // We will rely on parent component render cycle or handleFinish idempotency
                     return 1000;
                 }
                 return Math.min(1000, newProgress);
             });
          }, 50);
          return () => clearInterval(interval);
      }
  }, [gameState, speed, isPaused]);

  useEffect(() => {
      if (playerProgress >= 1000 && gameState === 'racing') {
          setGameState('finished');
          handleFinish();
      }
  }, [playerProgress, gameState]);

  const handleFinish = () => {
      const isWin = playerProgress >= 1000 && playerProgress > botProgress;
      if (isWin) playSound('win'); else playSound('lose');

      setTimeout(() => {
          onGameOver({
              score: score + (isWin ? 1000 : 0),
              streak,
              questionsAnswered: currentIndex + 1,
              correctAnswers: Math.floor(score / 100),
              timeElapsed: (Date.now() - startTime) / 1000,
              level: 1
          });
      }, 3000);
  };

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
      setShowQuestion(false);
      setBoostMode(true);

      if (isCorrect) {
          playSound('correct');
          setScore(s => s + 100 + (streak * 20));
          setStreak(s => s + 1);
          setSpeed(220); // Turbo
          
          setTimeout(() => {
             setBoostMode(false);
          }, 2000);
      } else {
          playSound('wrong');
          setStreak(0);
          setSpeed(20); 
          setBoostMode(false);
      }

      if (currentIndex + 1 >= questions.length) {
          // No more questions, wait for finish or force finish if progress is slow?
          // Let's just keep racing until end of track
          // But if player is too slow, they might lose.
      } else {
          setCurrentIndex(prev => prev + 1);
          setTimeout(() => {
              if (gameState === 'racing') setShowQuestion(true);
          }, 2500);
      }
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setPlayerProgress(0);
    setBotProgress(0);
    setSpeed(0);
    setGameState('countdown');
    setCountdown(3);
    setIsPaused(false);
  };

  return (
    <div className="relative w-full h-full bg-sky-300 overflow-hidden font-sans select-none">
       <PauseMenu 
         onPause={() => setIsPaused(true)}
         onResume={() => setIsPaused(false)}
         onRestart={handleRestart}
         onQuit={onExit || (() => {})}
       />

       {/* Sky */}
       <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-sky-400 to-sky-100"></div>
       
       {/* Ground/Grass */}
       <div className="absolute bottom-0 w-full h-1/2 bg-green-600 overflow-hidden">
           <div className="absolute inset-0 opacity-20" 
                style={{ 
                    backgroundImage: 'linear-gradient(0deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #ffffff 25%, #ffffff 26%, transparent 27%, transparent 74%, #ffffff 75%, #ffffff 76%, transparent 77%, transparent)',
                    backgroundSize: '50px 50px',
                    transform: `perspective(500px) rotateX(60deg) translateY(${bgOffset % 50}px) scale(2)` 
                }}>
           </div>
       </div>

       {/* Road */}
       <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1/2 bg-stone-800"
            style={{ 
                clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)' 
            }}
       >
           <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-dashed-line flex flex-col items-center overflow-hidden">
               <MotionDiv 
                 className="w-2 h-[200%] bg-[repeating-linear-gradient(to_bottom,white_0,white_50px,transparent_50px,transparent_100px)]"
                 animate={!isPaused ? { y: [0, 100] } : {}}
                 transition={{ repeat: Infinity, duration: speed > 0 ? 100/speed : 10000, ease: "linear" }}
               />
           </div>
       </div>

       {/* Finish Line */}
       {playerProgress > 900 && (
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-32 z-10 flex items-end justify-center"
                style={{ transform: `scale(${1 + (playerProgress - 900)/100}) perspective(500px)` }}
           >
               <div className="w-full h-4 bg-[repeating-linear-gradient(45deg,black,black_20px,white_20px,white_40px)]"></div>
           </div>
       )}

       {/* HUD */}
       <div className="absolute top-4 left-20 right-4 flex justify-between z-40 text-white pointer-events-none">
           <div className="bg-slate-900/80 px-4 py-2 rounded-xl flex items-center gap-4 border border-slate-700 shadow-xl">
               <div className="flex items-center gap-2 text-yellow-400 font-bold">
                   <Trophy size={18} /> {score}
               </div>
               <div className="flex items-center gap-2 text-orange-400 font-bold">
                   <Zap size={18} /> {streak}x
               </div>
           </div>

           <div className="bg-slate-900/80 w-32 h-32 rounded-full border-4 border-slate-700 relative flex items-center justify-center shadow-xl">
               <div className="absolute bottom-4 text-xl font-black italic">{Math.round(speed)} <span className="text-xs font-normal text-slate-400">KM/H</span></div>
               <Gauge size={24} className="absolute top-4 text-slate-500" />
               <MotionDiv 
                 className="absolute w-1 h-12 bg-red-500 origin-bottom"
                 style={{ bottom: '50%', left: 'calc(50% - 2px)' }}
                 animate={{ rotate: -120 + (speed / 240) * 240 }}
               />
           </div>
       </div>

       {/* Progress Bar */}
       <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-md h-2 bg-slate-700 rounded-full overflow-hidden border border-white/20 z-50">
           <MotionDiv 
             className="h-full bg-blue-500"
             style={{ width: `${(playerProgress / 1000) * 100}%` }}
           />
           <div className="absolute top-0 h-full w-2 bg-red-500" style={{ left: `${(botProgress / 1000) * 100}%` }} />
       </div>

       {/* Cars */}
       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-40 z-30 pointer-events-none">
           <div className="absolute transition-all duration-500" 
                style={{ 
                    bottom: `${20 + (botProgress - playerProgress) * 2}%`, 
                    right: '25%', 
                    transform: `scale(${0.5 + Math.max(0, 1 - Math.abs(botProgress - playerProgress)/500)})` 
                }}>
               <RaceCar color="#ef4444" isPlayer={false} label="Bot" />
           </div>

           <div className="absolute bottom-0 left-1/4 transform translate-x-[-50%] z-20">
               <RaceCar color="#3b82f6" isPlayer={true} label="You" />
           </div>
           
           {boostMode && (
               <div className="absolute bottom-0 left-1/4 transform translate-x-[-50%] z-10 w-full flex justify-center">
                   <MotionDiv 
                     className="w-20 h-40 bg-gradient-to-t from-transparent to-cyan-400 opacity-50 blur-xl"
                     animate={{ height: [100, 150, 100], opacity: [0.3, 0.6, 0.3] }}
                     transition={{ repeat: Infinity, duration: 0.1 }}
                   />
               </div>
           )}
       </div>

       {/* Countdown Overlay */}
       <AnimatePresence>
           {gameState === 'countdown' && (
               <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center">
                   <MotionDiv 
                     key={countdown}
                     initial={{ scale: 0.5, opacity: 0 }}
                     animate={{ scale: 1.5, opacity: 1 }}
                     exit={{ scale: 2, opacity: 0 }}
                     className="text-9xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                   >
                       {countdown === 0 ? "GO!" : countdown}
                   </MotionDiv>
               </div>
           )}
       </AnimatePresence>

       {/* Question Overlay */}
       <AnimatePresence>
           {gameState === 'racing' && showQuestion && questions[currentIndex] && !isPaused && (
               <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/40">
                   <div className="w-full max-w-2xl">
                       <QuestionOverlay 
                         question={questions[currentIndex]} 
                         onAnswer={handleAnswer} 
                         streak={streak} 
                       />
                   </div>
               </div>
           )}
       </AnimatePresence>

       {/* Game Over */}
       {gameState === 'finished' && (
           <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-white">
               <Flag size={80} className="text-white mb-4 animate-bounce" />
               <h1 className="text-5xl font-black italic">RACE FINISHED</h1>
               <p className="text-xl text-slate-300 mt-2">Calculating results...</p>
           </div>
       )}

    </div>
  );
};

export default RaceTrack;
