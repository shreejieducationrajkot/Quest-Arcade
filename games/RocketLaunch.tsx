
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { NEW_GAME_METADATA } from '../constants';
import QuestionOverlay from './components/QuestionOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

interface RocketLaunchProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const MotionDiv = motion.div as any;

const RocketLaunch: React.FC<RocketLaunchProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fuel, setFuel] = useState(0); 
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showQuestion, setShowQuestion] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [isBlasting, setIsBlasting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const meta = NEW_GAME_METADATA.ROCKET_LAUNCH;

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5));
    }
  }, [student, customQuestions]);

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
    setShowQuestion(false);
    
    if (isCorrect) {
      const msg = meta.hit[Math.floor(Math.random() * meta.hit.length)];
      setFeedback(msg);
      setScore(prev => prev + 100);
      setFuel(prev => Math.min(100, prev + 20));
      setStreak(prev => prev + 1);
    } else {
      const msg = meta.miss[Math.floor(Math.random() * meta.miss.length)];
      setFeedback(msg);
      setStreak(0);
      setFuel(prev => Math.max(0, prev - 10));
    }

    setTimeout(() => {
      setFeedback(null);
      if (fuel >= 80 && isCorrect) {
          setIsBlasting(true);
          setTimeout(() => {
              onGameOver({
                score: score + 1000,
                streak,
                questionsAnswered: currentIndex + 1,
                correctAnswers: score / 100,
                timeElapsed: (Date.now() - startTime) / 1000,
                level: 1
              });
          }, 3000);
      } else if (currentIndex + 1 >= questions.length) {
        onGameOver({
          score,
          streak,
          questionsAnswered: currentIndex + 1,
          correctAnswers: score / 100,
          timeElapsed: (Date.now() - startTime) / 1000,
          level: 1
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowQuestion(true);
      }
    }, 2000);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setFuel(0);
    setCurrentIndex(0);
    setIsBlasting(false);
    setShowQuestion(true);
    setIsPaused(false);
  };

  if (questions.length === 0) return null;

  return (
    <div className={`relative w-full h-full bg-slate-900 transition-all duration-1000 overflow-hidden ${isBlasting ? 'brightness-150' : ''}`}>
      <PauseMenu 
        onQuit={onExit || (() => {})} 
        onRestart={handleRestart}
        onResume={() => setIsPaused(false)}
      />

      <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
             <div key={i} className="absolute bg-white rounded-full w-1 h-1" style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }} />
          ))}
      </div>

      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs">
          <div className="flex justify-between text-xs font-black text-cyan-400 mb-1 px-1 uppercase">
              <span>Fuel Tank</span>
              <span>{fuel}%</span>
          </div>
          <div className="w-full h-4 bg-slate-800 rounded-full border border-slate-700 overflow-hidden shadow-lg">
              <MotionDiv 
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-400"
                initial={{ width: 0 }}
                animate={{ width: `${fuel}%` }}
              />
          </div>
      </div>

      <AnimatePresence>
        {isBlasting && (
           <MotionDiv 
             initial={{ y: 500 }}
             animate={{ y: -1000 }}
             transition={{ duration: 3, ease: "easeIn" }}
             className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[12rem] drop-shadow-2xl"
           >
             🚀
             <div className="absolute top-full left-1/2 -translate-x-1/2 text-6xl animate-pulse">🔥</div>
           </MotionDiv>
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6">
        <AnimatePresence>
            {feedback && (
                <MotionDiv 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="mb-10 bg-indigo-600 px-6 py-3 rounded-2xl text-white font-black text-xl shadow-xl"
                >
                    {feedback}
                </MotionDiv>
            )}
        </AnimatePresence>

        {showQuestion && !isBlasting && !isPaused && (
           <div className="w-full max-w-4xl">
              <QuestionOverlay 
                question={questions[currentIndex]} 
                onAnswer={handleAnswer} 
                streak={streak} 
              />
           </div>
        )}
      </div>

      <div className="absolute bottom-10 left-10 text-6xl opacity-20 pointer-events-none">🛰️</div>
    </div>
  );
};

export default RocketLaunch;
