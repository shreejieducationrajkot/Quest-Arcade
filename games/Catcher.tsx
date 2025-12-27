import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { Trophy, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

// --- Types ---
interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  isPaused: boolean;
}

interface FallingItem {
  id: string;
  x: number;
  y: number;
  optionIndex: number;
  text: string;
  emoji: string;
  speed: number;
  caught: boolean;
}

const EMOJIS = ['⭐', '💎', '🌟', '✨', '🔮', '💫', '🎁', '🍎'];

// --- Game Component ---
const CatcherGameComponent: React.FC<MiniGameProps> = ({ question, onAnswer, isPaused }) => {
  const [basketX, setBasketX] = useState(50);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [caughtItem, setCaughtItem] = useState<FallingItem | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const gameRef = useRef<HTMLDivElement>(null);
  const itemIdRef = useRef(0);

  // Spawn items
  useEffect(() => {
    if (!gameActive || isPaused) return;

    const spawnItem = () => {
      const optionIndex = Math.floor(Math.random() * question.options.length);
      const newItem: FallingItem = {
        id: `item-${itemIdRef.current++}`,
        x: 10 + Math.random() * 80,
        y: -10,
        optionIndex,
        text: question.options[optionIndex],
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
        speed: 1 + Math.random() * 0.5,
        caught: false,
      };
      setItems(prev => [...prev, newItem]);
    };

    // Initial burst
    if (items.length === 0) {
        question.options.forEach((_, idx) => {
          setTimeout(() => spawnItem(), idx * 800);
        });
    }

    const spawnInterval = setInterval(spawnItem, 2500);
    return () => clearInterval(spawnInterval);
  }, [gameActive, question.options, isPaused]);

  // Animation Loop
  useEffect(() => {
    if (!gameActive || isPaused) return;

    const animationFrame = setInterval(() => {
      setItems(prev => {
        return prev
          .map(item => {
            if (item.caught) return item;
            
            const newY = item.y + item.speed;
            
            // Collision Detection
            const basketLeft = basketX - 12;
            const basketRight = basketX + 12;
            const basketTop = 75;
            
            if (
              newY >= basketTop && 
              newY <= basketTop + 10 &&
              item.x >= basketLeft && 
              item.x <= basketRight
            ) {
              setCaughtItem(item);
              setGameActive(false);
              
              setTimeout(() => {
                const isCorrect = item.optionIndex === question.correctAnswer;
                onAnswer(item.optionIndex, isCorrect);
              }, 800);
              
              return { ...item, caught: true };
            }
            
            return { ...item, y: newY };
          })
          .filter(item => item.y < 100 || item.caught);
      });
    }, 50);

    return () => clearInterval(animationFrame);
  }, [gameActive, basketX, question.correctAnswer, onAnswer, isPaused]);

  // Movement
  const handleMouseMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!gameRef.current || !gameActive || isPaused) return;
    
    const rect = gameRef.current.getBoundingClientRect();
    let clientX: number;
    
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
      } else {
        return; // No active touches
      }
    } else {
      clientX = e.clientX;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  }, [gameActive, isPaused]);

  return (
    <div 
      ref={gameRef}
      className="relative w-full h-[600px] bg-gradient-to-b from-indigo-900 via-purple-800 to-pink-700 rounded-3xl overflow-hidden cursor-none shadow-2xl border-4 border-indigo-500"
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
      `}</style>

      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Instruction */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full z-10 border border-white/20">
        <p className="text-white font-bold text-sm md:text-base whitespace-nowrap">
          🧺 Catch: <span className="text-yellow-300">{question.options[question.correctAnswer]}</span>
        </p>
      </div>

      {/* Items */}
      {items.map((item) => (
        <div
          key={item.id}
          className={`absolute transform -translate-x-1/2 transition-all duration-100
                     ${item.caught ? 'scale-150 opacity-0' : ''}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-pulse" />
            <div className="relative bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30 shadow-lg flex flex-col items-center min-w-[80px]">
              <span className="text-2xl mb-1">{item.emoji}</span>
              <span className="text-white font-bold text-xs text-center leading-tight">{item.text}</span>
            </div>
          </div>
        </div>
      ))}

      {/* Basket */}
      <div 
        className="absolute bottom-[10%] transform -translate-x-1/2 transition-all duration-75"
        style={{ left: `${basketX}%` }}
      >
        <div className="relative">
          <div className="absolute -inset-4 bg-yellow-400/30 rounded-full blur-xl animate-pulse" />
          <div className="text-7xl">🧺</div>
          {caughtItem && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
              {caughtItem.emoji}
            </div>
          )}
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-black/30 backdrop-blur-sm" />

      {/* Feedback */}
      {caughtItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="bg-white rounded-2xl p-8 text-center animate-bounce shadow-2xl">
            <div className="text-6xl mb-2">🎉</div>
            <p className="text-2xl font-black text-indigo-900">CAUGHT!</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Wrapper ---
interface CatcherProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const Catcher: React.FC<CatcherProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
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
    if (isGameOver) return;

    if (isCorrect) {
      setScore(prev => prev + 100);
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
                    level: 1
                });
           }, 1000);
       } else {
           setCurrentQIndex(prev => (prev + 1) % questions.length);
       }
    }, 1500);
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentQIndex(0);
    setCorrectAnswers(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  if (questions.length === 0) return <div className="text-white text-center p-10">Loading Catcher...</div>;

  return (
    <div className="w-full min-h-screen bg-indigo-950 flex flex-col font-sans">
       <PauseMenu 
         onPause={() => setIsPaused(true)}
         onResume={() => setIsPaused(false)}
         onRestart={handleRestart}
         onQuit={onExit || (() => {})}
       />

       {/* HUD */}
       <div className="bg-indigo-900 p-4 shadow-lg flex justify-between items-center text-white border-b-4 border-indigo-800">
           <div className="flex gap-6 ml-20">
               <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl"><Trophy className="text-yellow-400"/> {score}</div>
           </div>
           <div className="font-black text-pink-400">STAR CATCHER</div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4">
           {!isGameOver && questions[currentQIndex] && (
               <div className="w-full max-w-3xl">
                   <CatcherGameComponent 
                      key={currentQIndex}
                      question={questions[currentQIndex]}
                      onAnswer={handleAnswer}
                      isPaused={isPaused}
                   />
               </div>
           )}
           {isGameOver && (
               <div className="text-white text-4xl font-black">GAME OVER</div>
           )}
       </div>
    </div>
  );
};

export default Catcher;