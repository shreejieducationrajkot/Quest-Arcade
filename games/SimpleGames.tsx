
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import QuestionOverlay from './components/QuestionOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Search, ChefHat, Puzzle, Ghost, CheckCircle } from 'lucide-react';
import { useSound } from './components/SoundManager';

// === SHARED LOGIC ===
const useSimpleGameLogic = (student: StudentProfile, onGameOver: (r: GameState) => void, limit: number = 10, customQuestions?: Question[] | null) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showQuestion, setShowQuestion] = useState(true);
  const [startTime] = useState(Date.now());
  const { playSound } = useSound();

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, limit));
    }
  }, [student, limit, customQuestions]);

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
    setShowQuestion(false);
    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 100 + (streak * 10));
      setStreak(s => s + 1);
    } else {
      playSound('wrong');
      setStreak(0);
    }
    return isCorrect;
  };

  const nextTurn = () => {
    if (currentIndex + 1 >= questions.length) {
      onGameOver({
        score,
        streak,
        questionsAnswered: currentIndex + 1,
        correctAnswers: Math.floor(score / 100), // Approx
        timeElapsed: (Date.now() - startTime) / 1000,
        level: 1
      });
    } else {
      setCurrentIndex(p => p + 1);
      setShowQuestion(true);
    }
  };

  return { questions, currentIndex, score, streak, showQuestion, handleAnswer, nextTurn };
};

const MotionDiv = motion.div as any;

// === 1. GARDEN GROWER ===
export const GardenGame: React.FC<{ student: StudentProfile, customQuestions?: Question[] | null, onGameOver: (r: GameState) => void }> = (props) => {
  const game = useSimpleGameLogic(props.student, props.onGameOver, 5, props.customQuestions); // 5 stages of growth
  const [growth, setGrowth] = useState(0);

  const onAnswer = (correct: boolean, t: number) => {
    game.handleAnswer(correct, t);
    if (correct) setGrowth(g => g + 20);
    setTimeout(game.nextTurn, 1500);
  };

  if (!game.questions.length) return null;

  return (
    <div className="w-full h-full bg-sky-100 flex flex-col items-center justify-end overflow-hidden relative">
      <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-xl font-bold text-green-700 flex items-center gap-2">
        <Sprout /> Score: {game.score}
      </div>
      
      {/* Sun */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-400 rounded-full blur-xl opacity-80 animate-pulse"></div>
      <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full shadow-lg"></div>

      {/* Plant */}
      <div className="relative z-10 flex flex-col items-center origin-bottom transition-all duration-1000" style={{ transform: `scale(${0.5 + (growth / 100)})` }}>
         <div className="text-9xl mb-[-20px] z-10 filter drop-shadow-xl">🌻</div>
         <div className="w-4 h-32 bg-green-600 rounded-full"></div>
         <div className="flex gap-10">
            <div className="w-16 h-8 bg-green-500 rounded-full rotate-[-20deg]"></div>
            <div className="w-16 h-8 bg-green-500 rounded-full rotate-[20deg]"></div>
         </div>
         <div className="w-6 h-20 bg-green-700 -mt-4"></div>
      </div>
      
      {/* Pot */}
      <div className="z-20 w-48 h-40 bg-orange-700 rounded-b-[3rem] border-t-8 border-orange-800 shadow-2xl mb-10 flex items-center justify-center">
         <span className="text-white/50 font-black text-xl uppercase">{props.student.name}'s Garden</span>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 w-full h-16 bg-green-800"></div>

      {game.showQuestion && (
        <div className="absolute inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
           <div className="w-full max-w-2xl">
             <QuestionOverlay question={game.questions[game.currentIndex]} onAnswer={onAnswer} streak={game.streak} />
           </div>
        </div>
      )}
    </div>
  );
};

// === 2. COOKING MASTER ===
export const CookingGame: React.FC<{ student: StudentProfile, customQuestions?: Question[] | null, onGameOver: (r: GameState) => void }> = (props) => {
  const game = useSimpleGameLogic(props.student, props.onGameOver, 8, props.customQuestions);
  const [ingredients, setIngredients] = useState<string[]>(['🍞']); // Start with bottom bun

  const ITEMS = ['🥬', '🍅', '🧀', '🥩', '🥒', '🧅', '🥓', '🍳'];

  const onAnswer = (correct: boolean, t: number) => {
    game.handleAnswer(correct, t);
    if (correct) {
       setIngredients(prev => [...prev, ITEMS[prev.length % ITEMS.length]]);
    }
    setTimeout(game.nextTurn, 1000);
  };

  if (!game.questions.length) return null;

  return (
    <div className="w-full h-full bg-amber-50 flex flex-col items-center justify-center relative overflow-hidden">
       {/* Background Pattern */}
       <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/food.png')]"></div>

       <div className="absolute top-4 left-4 bg-white p-2 rounded-xl font-bold text-amber-700 flex items-center gap-2 border-2 border-amber-200">
        <ChefHat /> Orders Complete: {ingredients.length - 1}
      </div>

       <div className="flex flex-col-reverse items-center gap-[-10px] mb-20 scale-150 transition-all">
          <div className="text-8xl drop-shadow-xl z-50">🍞</div> {/* Top Bun (Always render last/top visually if we want, but simpler to just stack up) */}
          {ingredients.slice(1).reverse().map((item, i) => (
             <MotionDiv 
               key={i} 
               initial={{ y: -100, opacity: 0 }} 
               animate={{ y: 0, opacity: 1 }} 
               className="text-7xl -my-4 drop-shadow-md z-40"
             >
                {item}
             </MotionDiv>
          ))}
          <div className="text-8xl -my-4 drop-shadow-xl z-0">🍞</div> {/* Bottom Bun */}
       </div>

       <div className="absolute bottom-0 w-full h-4 bg-amber-900/20 blur-xl"></div>

       {game.showQuestion && (
        <div className="absolute inset-0 z-50 p-4 flex items-center justify-center bg-black/40">
           <div className="w-full max-w-2xl">
             <QuestionOverlay question={game.questions[game.currentIndex]} onAnswer={onAnswer} streak={game.streak} />
           </div>
        </div>
      )}
    </div>
  );
};

// === 3. JIGSAW REVEAL ===
export const JigsawGame: React.FC<{ student: StudentProfile, customQuestions?: Question[] | null, onGameOver: (r: GameState) => void }> = (props) => {
  const game = useSimpleGameLogic(props.student, props.onGameOver, 9, props.customQuestions);
  const [revealed, setRevealed] = useState<boolean[]>(Array(9).fill(false));

  const onAnswer = (correct: boolean, t: number) => {
    game.handleAnswer(correct, t);
    if (correct) {
       setRevealed(prev => {
         const next = [...prev];
         next[game.currentIndex] = true;
         return next;
       });
    }
    setTimeout(game.nextTurn, 1500);
  };

  if (!game.questions.length) return null;

  return (
    <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4">
       <div className="absolute top-4 flex gap-4 text-white font-bold">
          <Puzzle className="text-purple-400"/> Puzzle Mode
       </div>

       <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-slate-600">
          {/* Underlying Image */}
          <img 
            src={`https://source.unsplash.com/random/800x800?nature,landscape&sig=${game.score}`} 
            alt="Secret" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Grid Cover */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
             {revealed.map((isRevealed, i) => (
                <MotionDiv
                   key={i}
                   className="bg-slate-700 border border-slate-600 flex items-center justify-center"
                   animate={{ opacity: isRevealed ? 0 : 1, scale: isRevealed ? 0 : 1 }}
                   transition={{ duration: 0.5 }}
                >
                   <span className="text-slate-500 font-black text-2xl">?</span>
                </MotionDiv>
             ))}
          </div>
       </div>

       {game.showQuestion && (
        <div className="absolute inset-0 z-50 p-4 flex items-center justify-center bg-slate-900/80">
           <div className="w-full max-w-2xl">
             <QuestionOverlay question={game.questions[game.currentIndex]} onAnswer={onAnswer} streak={game.streak} />
           </div>
        </div>
      )}
    </div>
  );
};

// === 4. DETECTIVE CASE ===
export const DetectiveGame: React.FC<{ student: StudentProfile, customQuestions?: Question[] | null, onGameOver: (r: GameState) => void }> = (props) => {
  const game = useSimpleGameLogic(props.student, props.onGameOver, 8, props.customQuestions);
  const [clues, setClues] = useState<number>(0);

  const onAnswer = (correct: boolean, t: number) => {
    game.handleAnswer(correct, t);
    if (correct) setClues(c => c + 1);
    setTimeout(game.nextTurn, 1500);
  };

  if (!game.questions.length) return null;

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
       <div className="absolute top-6 left-6 text-white font-mono text-xl flex items-center gap-2">
          <Search className="text-cyan-400" /> CASE FILE #921
       </div>

       <div className="bg-[#f5f5dc] p-8 rounded shadow-xl max-w-3xl w-full h-[60%] relative rotate-1 transform border-8 border-slate-800 flex flex-wrap content-start gap-4 overflow-hidden">
          <div className="absolute top-[-20px] left-[50%] -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md"></div>
          
          <h2 className="w-full text-center font-black text-2xl text-slate-800 border-b-2 border-slate-300 pb-2 mb-4 uppercase tracking-widest">Evidence Board</h2>
          
          {Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="w-24 h-24 bg-white border-2 border-slate-300 shadow p-2 flex items-center justify-center transform rotate-[-2deg] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
                {i < clues ? (
                   <MotionDiv initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl">
                      {['👣', '🔍', '📄', '🗝️', '🧬', '📸', '🔦', '📂'][i]}
                   </MotionDiv>
                ) : (
                   <span className="text-slate-200 text-4xl">?</span>
                )}
             </div>
          ))}
       </div>

       {game.showQuestion && (
        <div className="absolute inset-0 z-50 p-4 flex items-center justify-center bg-black/80">
           <div className="w-full max-w-2xl">
             <QuestionOverlay question={game.questions[game.currentIndex]} onAnswer={onAnswer} streak={game.streak} />
           </div>
        </div>
      )}
    </div>
  );
};

// === 5. MONSTER ALBUM ===
export const MonsterGame: React.FC<{ student: StudentProfile, customQuestions?: Question[] | null, onGameOver: (r: GameState) => void }> = (props) => {
  const game = useSimpleGameLogic(props.student, props.onGameOver, 12, props.customQuestions);
  const [unlocked, setUnlocked] = useState<number[]>([]);

  const MONSTERS = ['👾', '👹', '👺', '👻', '👽', '🤖', '🎃', '🧟', '🧛', '🧜', '🧚', '🧞'];

  const onAnswer = (correct: boolean, t: number) => {
    game.handleAnswer(correct, t);
    if (correct) setUnlocked(prev => [...prev, game.currentIndex]);
    setTimeout(game.nextTurn, 1000);
  };

  if (!game.questions.length) return null;

  return (
    <div className="w-full h-full bg-purple-900 p-8 flex flex-col items-center">
       <h1 className="text-3xl font-black text-white mb-6 flex items-center gap-2">
          <Ghost /> MONSTER COLLECTION
       </h1>

       <div className="grid grid-cols-3 md:grid-cols-4 gap-4 w-full max-w-4xl">
          {MONSTERS.map((m, i) => {
             const isUnlocked = unlocked.includes(i);
             return (
               <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center text-6xl shadow-inner border-4 transition-all ${isUnlocked ? 'bg-white border-purple-300' : 'bg-purple-950 border-purple-800'}`}>
                  {isUnlocked ? (
                     <MotionDiv initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}>
                        {m}
                     </MotionDiv>
                  ) : (
                     <span className="text-purple-800 font-black text-2xl">#{i+1}</span>
                  )}
               </div>
             )
          })}
       </div>

       {game.showQuestion && (
        <div className="absolute inset-0 z-50 p-4 flex items-center justify-center bg-purple-900/90 backdrop-blur">
           <div className="w-full max-w-2xl">
             <QuestionOverlay question={game.questions[game.currentIndex]} onAnswer={onAnswer} streak={game.streak} />
           </div>
        </div>
      )}
    </div>
  );
};
