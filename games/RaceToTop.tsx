import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question, GameResult } from '../types';
import QuestionOverlay from './components/QuestionOverlay';
import { getQuestionsForGrade } from '../QuestionBank';
import { Flag } from 'lucide-react';
import { motion } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

interface RaceToTopProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameResult) => void;
  onExit?: () => void;
}

const RaceToTop: React.FC<RaceToTopProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  
  // Game State
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const [botProgress, setBotProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [history, setHistory] = useState<{ questionId: string; skill: string; correct: boolean; timeTaken: number }[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
    
    const botInterval = setInterval(() => {
        if (!isPaused) {
            setBotProgress(prev => {
                if (prev >= 100) return 100;
                return prev + (Math.random() * 2);
            });
        }
    }, 1000);

    return () => clearInterval(botInterval);
  }, [student, customQuestions, isPaused]);

  useEffect(() => {
      // Just track bot status visually, don't end game
      if (botProgress >= 100 && gameStatus === 'playing') {
          // Bot wins visual
      }
  }, [botProgress, gameStatus]);

  useEffect(() => {
      if (questions.length > 0 && gameStatus === 'playing' && !showQuestion && !isPaused) {
          const timer = setTimeout(() => setShowQuestion(true), 1000);
          return () => clearTimeout(timer);
      }
  }, [questions, currentQIndex, gameStatus, showQuestion, isPaused]);

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
      const q = questions[currentQIndex];
      setHistory(prev => [...prev, { questionId: q.id, skill: q.skill, correct: isCorrect, timeTaken }]);
      setShowQuestion(false);
      
      if (isCorrect) {
          setScore(prev => prev + 100 + (streak * 10));
          setStreak(prev => prev + 1);
          setCorrectAnswers(prev => prev + 1);
          setProgress(prev => Math.min(100, prev + 15));
      } else {
          setStreak(0);
          setProgress(prev => Math.max(0, prev - 5));
      }

      if (currentQIndex + 1 >= questions.length) {
          // If user reaches top or questions run out
          if (progress + 15 >= 100 && isCorrect) {
             setGameStatus('won');
          } else {
             setGameStatus(progress >= botProgress ? 'won' : 'lost');
          }
          finishGame(progress >= botProgress);
      } else {
         setCurrentQIndex(prev => (prev + 1) % questions.length);
      }
  };

  const finishGame = (won: boolean) => {
      setTimeout(() => {
          onGameOver({
              score,
              streak,
              questionsAnswered: history.length,
              correctAnswers,
              timeElapsed: (Date.now() - startTime) / 1000,
              level: 1,
              history: history.map(h => ({ questionId: h.questionId, correct: h.correct, timeTaken: h.timeTaken }))
          });
      }, 2000);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentQIndex(0);
    setProgress(0);
    setBotProgress(0);
    setGameStatus('playing');
    setHistory([]);
    setIsPaused(false);
  };

  if (!student) return null;

  return (
    <div className="relative w-full h-full min-h-screen bg-sky-200 overflow-hidden flex flex-col items-center justify-end p-4">
       <PauseMenu 
         onPause={() => setIsPaused(true)}
         onResume={() => setIsPaused(false)}
         onRestart={handleRestart}
         onQuit={onExit || (() => {})}
       />

       <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <div className="w-[150%] h-[80%] bg-stone-700 transform rotate-0" 
               style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
          <div className="absolute top-[20%] text-white opacity-80">
               <Flag size={48} className="text-red-500 fill-red-500" />
          </div>
       </div>

       <div className="absolute inset-0 w-full max-w-2xl mx-auto h-full pointer-events-none">
           <div 
             className="absolute bottom-0 left-[20%] transition-all duration-700 ease-out flex flex-col items-center"
             style={{ bottom: `${10 + (progress * 0.7)}%`, left: `calc(50% - 40px - ${(progress * 0.3)}px)` }}
           >
               <span className="text-4xl">{student.avatar}</span>
               <span className="bg-white/80 px-2 rounded text-xs font-bold">You</span>
           </div>

           <div 
             className="absolute bottom-0 right-[20%] transition-all duration-700 ease-linear flex flex-col items-center grayscale opacity-80"
             style={{ bottom: `${10 + (botProgress * 0.7)}%`, left: `calc(50% + 40px + ${(botProgress * 0.3)}px)` }}
           >
               <span className="text-4xl">🤖</span>
               <span className="bg-black/80 text-white px-2 rounded text-xs font-bold">Bot</span>
           </div>
       </div>

       <div className="absolute top-4 left-20 right-4 flex justify-between bg-white/90 p-4 rounded-xl shadow-lg z-10 pointer-events-none">
           <div>
               <div className="text-xs text-slate-500 uppercase font-bold">Altitude</div>
               <div className="text-xl font-black text-indigo-600">{Math.round(progress)}m / 100m</div>
           </div>
           <div>
               <div className="text-xs text-slate-500 uppercase font-bold">Score</div>
               <motion.div 
                 key={score}
                 initial={{ scale: 1.5, color: '#f59e0b' }}
                 animate={{ scale: 1, color: '#f59e0b' }}
                 className="text-xl font-black text-amber-500"
               >
                 {score}
               </motion.div>
           </div>
       </div>

       {showQuestion && questions[currentQIndex] && !isPaused && (
           <QuestionOverlay 
             question={questions[currentQIndex]} 
             onAnswer={handleAnswer} 
             streak={streak} 
           />
       )}
       
       {gameStatus !== 'playing' && (
           <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center">
               <div className="bg-white p-8 rounded-2xl text-center animate-bounce">
                   <h2 className="text-4xl font-black mb-2">{gameStatus === 'won' ? 'VICTORY!' : 'FINISHED!'}</h2>
                   <p>{gameStatus === 'won' ? 'You reached the summit!' : 'The bot was faster this time.'}</p>
               </div>
           </div>
       )}
    </div>
  );
};

export default RaceToTop;