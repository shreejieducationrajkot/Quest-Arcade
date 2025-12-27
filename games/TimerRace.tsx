import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { Timer, Trophy, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

// --- Types ---
interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  timeLimit?: number;
  isPaused: boolean;
}

// --- Game Component ---
const TimerRaceGameComponent: React.FC<MiniGameProps> = ({ 
  question, 
  onAnswer,
  timeLimit = 5,
  isPaused
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!gameActive || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameActive, isPaused]);

  const handleTimeout = () => {
    setGameActive(false);
    onAnswer(-1, false);
  };

  const handleOptionClick = (index: number) => {
    if (!gameActive || isPaused) return;
    
    setGameActive(false);
    setSelectedOption(index);
    
    const isCorrect = index === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(index, isCorrect);
    }, 500);
  };

  const progress = (timeLeft / timeLimit) * 100;
  const isUrgent = timeLeft < timeLimit * 0.3;

  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-2xl p-8 flex flex-col relative overflow-hidden border-4 border-slate-700 shadow-2xl">
      {/* Background Pulse */}
      {isUrgent && !isPaused && (
        <div className="absolute inset-0 bg-red-600/20 animate-pulse z-0" />
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex items-center gap-2 text-white font-bold">
          <Zap className="text-yellow-400" />
          <span>SPEED ROUND</span>
        </div>
        <div className={`text-4xl font-mono font-black ${isUrgent ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
          {timeLeft.toFixed(1)}s
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-6 bg-slate-800 rounded-full mb-8 overflow-hidden border border-slate-600 relative z-10">
        <motion.div 
          className={`h-full ${isUrgent ? 'bg-red-500' : 'bg-cyan-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-10 relative z-10">
        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
          {question.text}
        </h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
        {question.options.map((option, idx) => {
          let btnClass = "bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-slate-300";
          
          if (selectedOption !== null) {
            if (idx === question.correctAnswer) {
              btnClass = "bg-green-600 border-green-400 text-white scale-105";
            } else if (idx === selectedOption) {
              btnClass = "bg-red-600 border-red-400 text-white scale-95 opacity-50";
            } else {
              btnClass = "bg-slate-800 border-slate-700 text-slate-600 opacity-30";
            }
          }

          return (
            <motion.button
              key={idx}
              whileHover={gameActive && !isPaused ? { scale: 1.02 } : {}}
              whileTap={gameActive && !isPaused ? { scale: 0.95 } : {}}
              onClick={() => handleOptionClick(idx)}
              disabled={!gameActive || isPaused}
              className={`rounded-2xl font-bold text-xl p-4 transition-all shadow-lg ${btnClass}`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Wrapper ---
interface TimerRaceProps {
  student: StudentProfile;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const TimerRace: React.FC<TimerRaceProps> = ({ student, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const qs = getQuestionsForGrade(student.grade);
    setQuestions(qs.sort(() => Math.random() - 0.5));
  }, [student.grade]);

  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    if (isGameOver || isPaused) return;

    if (isCorrect) {
      const streakBonus = streak * 10;
      setScore(prev => prev + 50 + streakBonus);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Always continue
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
    }, 1000);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentQIndex(0);
    setCorrectAnswers(0);
    setIsGameOver(false);
    setIsPaused(false);
  };

  if (questions.length === 0) return <div className="text-center p-10 text-white">Loading Race...</div>;

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col font-sans">
       <PauseMenu 
         onPause={() => setIsPaused(true)}
         onResume={() => setIsPaused(false)}
         onRestart={handleRestart}
         onQuit={onExit || (() => {})}
       />

       <div className="bg-slate-900 p-4 shadow-lg flex justify-between items-center text-white border-b-4 border-slate-800">
           <div className="ml-12 flex gap-6">
               <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
                 <Zap className="text-orange-500" fill="currentColor"/> Streak: 
                 <motion.span key={streak} initial={{ scale: 1.5 }} animate={{ scale: 1 }}> {streak}</motion.span>
               </div>
               <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl">
                 <Trophy className="text-yellow-400"/> 
                 <motion.span key={score} initial={{ scale: 1.5, color: "#FBBF24" }} animate={{ scale: 1, color: "#FFFFFF" }}>{score}</motion.span>
               </div>
           </div>
           <div className="font-black text-cyan-400"><Timer className="inline mr-2"/>SPEED RACER</div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4">
           {!isGameOver && questions[currentQIndex] && (
               <div className="w-full max-w-xl">
                   <TimerRaceGameComponent 
                      key={currentQIndex}
                      question={questions[currentQIndex]}
                      onAnswer={handleAnswer}
                      timeLimit={5} 
                      isPaused={isPaused}
                   />
               </div>
           )}
       </div>
    </div>
  );
};

export default TimerRace;