
// games/ArcherAdventure.tsx
// 🏹 Stickman Archer Survival Mode

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import TrapRoom from './TrapRoom';
import { motion } from 'framer-motion';
import { Question } from '../types';
import { PauseMenu } from './components/PauseMenu';

// ============================================
// TYPES
// ============================================

export interface ArcherProfile {
  name: string;
  grade: string;
  subject: string;
  chapter: string;
  difficulty: string;
  questionsCount: number;
  avatar?: string;
}

export interface ArcherGameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  accuracy: number;
  history: {
    questionId: string;
    correct: boolean;
    timeTaken: number;
  }[];
}

interface ArcherAdventureProps {
  profile: ArcherProfile;
  questions: Question[]; // Pass questions directly from parent
  onComplete: (result: ArcherGameResult) => void;
  onExit: () => void;
}

// ============================================
// MAIN COMPONENT
// ============================================

const ArcherAdventure: React.FC<ArcherAdventureProps> = ({
  profile,
  questions,
  onComplete,
  onExit,
}) => {
  // ----------------------------------------
  // STATE
  // ----------------------------------------
  const [gameStarted, setGameStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [history, setHistory] = useState<{ questionId: string; correct: boolean; timeTaken: number }[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Reset question timer when index changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  // ----------------------------------------
  // LOGIC: RESTART
  // ----------------------------------------
  const handleRestart = () => {
    setGameStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setIsGameOver(false);
    setGameStatus('playing');
    setHistory([]);
    setStartTime(Date.now());
    setQuestionStartTime(Date.now());
  };

  // ----------------------------------------
  // DERIVED VALUES
  // ----------------------------------------
  const currentQuestion = useMemo(() => {
    return questions[currentIndex] || null;
  }, [questions, currentIndex]);

  // ----------------------------------------
  // HANDLE COMPLETION FROM TRAP ROOM
  // ----------------------------------------
  const handleQuestionComplete = useCallback((isCorrect: boolean, roundScore: number) => {

    const timeTaken = (Date.now() - questionStartTime) / 1000;
    const currentQ = questions[currentIndex];

    setHistory(prev => [...prev, {
      questionId: String(currentQ.id),
      correct: isCorrect,
      timeTaken
    }]);

    if (isCorrect) {
      setScore(prev => prev + roundScore + (streak * 20));
      setCorrectCount(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Always check if this was the last question
    if (currentIndex + 1 >= questions.length) {
      finishGame(true);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length, streak]);

  const finishGame = (won: boolean) => {
    setIsGameOver(true);
    setGameStatus(won ? 'won' : 'lost');

    // Allow a moment for the user to see the state before triggering the callback
    setTimeout(() => {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      onComplete({
        score: score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTaken,
        accuracy: Math.round((correctCount / questions.length) * 100),
        history: history
      });
    }, 2000);
  };

  // ----------------------------------------
  // RENDER: START SCREEN
  // ----------------------------------------
  if (!gameStarted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center p-4 font-sans text-slate-800">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden border border-indigo-50"
        >
          <div className="relative z-10">
            {/* Archer Icon */}
            <div className="text-8xl mb-6 drop-shadow-md">🏹</div>

            <h1 className="text-4xl font-black text-indigo-900 mb-2 tracking-tight">
              Trap Room
            </h1>
            <p className="text-indigo-400 font-bold mb-8 uppercase tracking-widest text-sm">Survival Mode</p>

            <div className="bg-indigo-50 rounded-2xl p-6 mb-8 text-left">
              <p className="text-indigo-900 text-lg font-bold mb-2">
                Ready, {profile.name}?
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Answer correctly to survive. <br />
                Avoid the <span className="text-red-500 font-bold">Spikes</span>!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-bold text-slate-400">Levels</div>
                <div className="font-black text-slate-800">{questions.length}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                <div className="text-2xl mb-1">☠️</div>
                <div className="text-xs font-bold text-slate-400">Trap</div>
                <div className="font-black text-slate-800">Active</div>
              </div>
            </div>

            <button
              onClick={() => setGameStarted(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Start Adventure
            </button>

            <button
              onClick={onExit}
              className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              Exit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: GAME OVER
  // ----------------------------------------
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-9xl mb-6">{gameStatus === 'won' ? '🏆' : '🏁'}</div>
          <h2 className="text-5xl font-black text-slate-900 mb-4">COMPLETED!</h2>
          <p className="text-slate-500 font-bold text-xl">Calculating final score...</p>
        </motion.div>
      </div>
    );
  }

  // ----------------------------------------
  // RENDER: MAIN GAME
  // ----------------------------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 relative overflow-hidden font-sans text-slate-800">

      {/* Pause Menu (Replaces Back Button) */}
      <PauseMenu 
        onResume={() => {}} 
        onRestart={handleRestart} 
        onQuit={onExit} 
      />

      {/* 🧭 TOP HUD BAR */}
      <div className="absolute top-4 left-20 right-4 flex justify-between items-center z-50 pointer-events-none">

        {/* Level */}
        <div className="text-sm font-bold text-indigo-700 bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-indigo-50 backdrop-blur-sm">
          Level {currentIndex + 1} / {questions.length}
        </div>

        {/* Skill */}
        <div className="hidden md:block text-sm font-bold text-emerald-700 bg-emerald-50/90 px-4 py-2 rounded-xl shadow-sm backdrop-blur-sm">
          ⚡ {currentQuestion?.subject || 'General'}
        </div>

        {/* XP */}
        <div className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-xl shadow-sm border border-slate-100 backdrop-blur-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Score</span>
          <div className="text-lg font-black text-indigo-600">{score}</div>
        </div>

      </div>

      {/* ===== GAME VIEW ===== */}
      <div className="w-full h-full absolute inset-0">
        {currentQuestion && (
          <TrapRoom
            key={currentQuestion.id} // Re-mount on new question to reset trap state
            question={currentQuestion}
            onComplete={handleQuestionComplete}
            currentScore={score}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}
      </div>

    </div>
  );
};

export default ArcherAdventure;
