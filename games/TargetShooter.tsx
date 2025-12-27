
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, StudentProfile, Question, GameResult } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { Trophy, Target, ArrowLeft, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './components/SoundManager';

interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
}

interface BalloonObj {
  id: number;
  x: number;
  y: number;
  text: string;
  popped: boolean;
  color: string;
}

const BALLOON_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

const BalloonSVG: React.FC<{ color: string; text: string; popped: boolean }> = ({ color, text, popped }) => (
  <div className="relative flex flex-col items-center">
    <svg 
      viewBox="0 0 100 160" 
      className="w-32 h-48 drop-shadow-2xl overflow-visible"
    >
      <defs>
        {/* Main 3D Gradient */}
        <radialGradient id={`grad-${color.replace('#', '')}`} cx="35%" cy="35%" r="65%" fx="30%" fy="30%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.3 }} />
          <stop offset="60%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'black', stopOpacity: 0.2 }} />
        </radialGradient>
        
        {/* Shine Gradient */}
        <linearGradient id="shineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
        </linearGradient>
      </defs>

      {/* Balloon String */}
      <motion.path
        d="M50 100 Q 60 130 50 160"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2"
        fill="none"
        animate={{ d: ["M50 100 Q 60 130 50 160", "M50 100 Q 40 130 50 160", "M50 100 Q 60 130 50 160"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Balloon Knot */}
      <path d="M42 98 L58 98 L50 90 Z" fill={color} />

      {/* Balloon Body with 3D Depth */}
      <ellipse cx="50" cy="50" rx="42" ry="50" fill={color} />
      <ellipse cx="50" cy="50" rx="42" ry="50" fill={`url(#grad-${color.replace('#', '')})`} />
      
      {/* Subtle White Oval Shine (Top-Left) */}
      <ellipse 
        cx="32" 
        cy="30" 
        rx="12" 
        ry="18" 
        fill="url(#shineGrad)"
        transform="rotate(-20, 32, 30)"
        className="pointer-events-none"
      />

      {/* Secondary Sharp Highlight for "Wet" Look */}
      <circle 
        cx="25" 
        cy="22" 
        r="4" 
        fill="white" 
        fillOpacity="0.4" 
      />
    </svg>

    {/* Answer Text inside Balloon */}
    <div className="absolute inset-0 top-0 h-32 flex items-center justify-center p-4 pointer-events-none">
      <span className="text-white font-black text-xl text-center leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        {text}
      </span>
    </div>
  </div>
);

const TargetShooterGameComponent: React.FC<MiniGameProps> = ({ 
  question, 
  onAnswer 
}) => {
  const [balloons, setBalloons] = useState<BalloonObj[]>([]);
  const [isAiming, setIsAiming] = useState(false);
  const [arrowFlying, setArrowFlying] = useState(false);
  const [arrowTarget, setArrowTarget] = useState<{ x: number; y: number } | null>(null);
  const [bowAngle, setBowAngle] = useState(0);
  const gameRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSound();

  useEffect(() => {
    setBalloons(question.options.map((opt, idx) => ({
      id: idx,
      x: 18 + (idx % 2) * 64, 
      y: 20 + Math.floor(idx / 2) * 35,
      text: opt,
      popped: false,
      color: BALLOON_COLORS[idx % BALLOON_COLORS.length]
    })));
    setIsAiming(false);
    setArrowFlying(false);
    setArrowTarget(null);
    setBowAngle(0);
  }, [question]);

  const handleBalloonClick = useCallback((balloon: BalloonObj) => {
    if (arrowFlying || balloon.popped || !gameRef.current) return;

    setIsAiming(true);
    setArrowTarget({ x: balloon.x, y: balloon.y });

    const rect = gameRef.current.getBoundingClientRect();
    const startX = rect.width / 2;
    const startY = rect.height - 100;
    const targetPxX = (balloon.x / 100) * rect.width;
    const targetPxY = (balloon.y / 100) * rect.height;

    const deltaX = targetPxX - startX;
    const deltaY = targetPxY - startY;

    const angleRad = Math.atan2(deltaY, deltaX);
    const angleDeg = angleRad * (180 / Math.PI);
    setBowAngle(angleDeg + 90); 

    gameRef.current.style.setProperty('--tx', `${deltaX}px`);
    gameRef.current.style.setProperty('--ty', `${deltaY}px`);
    gameRef.current.style.setProperty('--rot', `${angleDeg + 45}deg`);

    setTimeout(() => {
      setArrowFlying(true);
      
      setTimeout(() => {
        setBalloons(prev => prev.map(b => 
          b.id === balloon.id ? { ...b, popped: true } : b
        ));
        
        playSound('pop');
        
        setTimeout(() => {
          const isCorrect = balloon.id === question.correctAnswer;
          onAnswer(balloon.id, isCorrect);
        }, 500);
      }, 400);
    }, 300);
  }, [arrowFlying, question.correctAnswer, onAnswer, playSound]);

  return (
    <div 
      ref={gameRef}
      className="relative w-full h-[600px] bg-gradient-to-b from-sky-400 to-sky-200 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50"
    >
      <style>{`
        @keyframes flyToTarget {
          0% { transform: translate(-50%, 0) rotate(var(--rot)); }
          100% { transform: translate(calc(-50% + var(--tx)), var(--ty)) rotate(var(--rot)); }
        }
      `}</style>

      {/* Background Clouds */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: [0, 50, 0] }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10"
        >
          <Cloud size={80} className="text-white fill-white" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, -40, 0] }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20"
        >
          <Cloud size={100} className="text-white fill-white" />
        </motion.div>
        <motion.div 
          animate={{ x: [0, 30, 0] }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 left-1/4"
        >
          <Cloud size={60} className="text-white fill-white" />
        </motion.div>
      </div>
      
      {/* Question Card */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 w-[90%] max-w-lg">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-[2rem] shadow-xl border-2 border-white text-center"
          >
              <h2 className="text-xl md:text-2xl font-black text-slate-800 leading-tight">
                {question.text}
              </h2>
          </motion.div>
      </div>

      {/* Balloons Container */}
      <div className="absolute inset-0 pointer-events-none">
        {balloons.map((balloon) => (
          <motion.div
            key={balloon.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: `${balloon.x}%`, top: `${balloon.y}%` }}
            animate={{ 
              y: [0, -15, 0],
              rotate: [-1, 1, -1]
            }}
            transition={{ 
              duration: 4 + balloon.id, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <AnimatePresence mode="wait">
              {!balloon.popped ? (
                <motion.button
                  key="balloon-active"
                  onClick={() => handleBalloonClick(balloon)}
                  disabled={arrowFlying || balloon.popped}
                  className="hover:scale-110 active:scale-95 transition-transform outline-none"
                  exit={{ 
                    scale: [1, 1.3, 0], 
                    opacity: [1, 1, 0],
                    transition: { 
                      duration: 0.15, 
                      times: [0, 0.4, 1],
                      ease: "easeOut"
                    } 
                  }}
                >
                  <BalloonSVG 
                    color={balloon.color} 
                    text={balloon.text} 
                    popped={balloon.popped} 
                  />
                </motion.button>
              ) : (
                <motion.div
                  key="balloon-pop"
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  className="text-4xl pointer-events-none"
                >
                  ✨
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Archer / Bow */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
        <div 
          className="relative w-24 h-24 transition-transform duration-300"
          style={{ transform: `rotate(${bowAngle}deg)` }}
        >
          <div className="absolute left-1/2 -translate-x-1/2 w-2 h-20 bg-amber-800 rounded-full shadow-lg" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-10 h-10 border-l-4 border-amber-800 rounded-tl-full" style={{ transform: 'translateX(-100%)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-10 h-10 border-l-4 border-amber-800 rounded-bl-full" style={{ transform: 'translateX(-100%)' }} />
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-20 bg-white opacity-80" />
          
          {!arrowFlying && isAiming && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-1/2 flex flex-col items-center">
              <div className="w-1 h-10 bg-slate-900" />
              <div className="w-0 h-0 border-l-4 border-r-4 border-b-10 border-l-transparent border-r-transparent border-b-slate-600" />
            </div>
          )}
        </div>
        <div className="text-6xl mt-2 filter drop-shadow-lg">🧝</div>
      </div>

      {/* Flying Arrow */}
      {arrowFlying && arrowTarget && (
        <div 
          className="absolute text-5xl z-30"
          style={{
            left: '50%',
            bottom: '100px',
            transform: 'translate(-50%, 0)',
            animation: `flyToTarget 0.4s ease-out forwards`,
          } as React.CSSProperties}
        >
          🏹
        </div>
      )}
    </div>
  );
};

interface TargetShooterProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameResult) => void;
}

const TargetShooter: React.FC<TargetShooterProps> = ({ student, customQuestions, onGameOver }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

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
    if (isGameOver) return;

    if (isCorrect) {
      setScore(prev => prev + 150);
      setCorrectAnswers(prev => prev + 1);
    }

    setTimeout(() => {
       if (currentQIndex + 1 >= questions.length) {
           setIsGameOver(true);
           setTimeout(() => {
             onGameOver({
                 score,
                 streak: 0,
                 questionsAnswered: questions.length,
                 correctAnswers,
                 timeElapsed: (Date.now() - startTime) / 1000,
                 level: 1,
                 history: [] 
             });
           }, 1000);
       } else {
           setCurrentQIndex(prev => (prev + 1) % questions.length);
       }
    }, 1500); 
  };

  if (questions.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-sky-100">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-4xl">🎈</motion.div>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-sky-50 flex flex-col font-sans">
       <div className="bg-white p-4 shadow-md flex justify-between items-center z-10 border-b-2 border-sky-100">
           <button 
             onClick={() => {
                onGameOver({
                    score,
                    streak: 0,
                    questionsAnswered: correctAnswers,
                    correctAnswers,
                    timeElapsed: (Date.now() - startTime) / 1000,
                    level: 1,
                    history: []
                });
             }} 
             className="p-2 hover:bg-sky-50 rounded-full transition-colors text-slate-400"
           >
             <ArrowLeft />
           </button>
           
           <div className="flex gap-4">
               <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-amber-600 font-bold">
                 <Trophy size={18} /> 
                 <motion.span 
                   key={score}
                   initial={{ scale: 1.5 }}
                   animate={{ scale: 1 }}
                 >
                   {score}
                 </motion.span>
               </div>
           </div>
           
           <div className="font-black text-sky-600 uppercase tracking-widest hidden sm:flex items-center gap-2">
             <Target size={20} /> Balloon Pop Adventure
           </div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4">
           {!isGameOver && questions[currentQIndex] && (
               <div className="w-full max-w-5xl">
                   <TargetShooterGameComponent 
                      key={currentQIndex}
                      question={questions[currentQIndex]}
                      onAnswer={handleAnswer}
                   />
               </div>
           )}
       </div>
    </div>
  );
};

export default TargetShooter;
