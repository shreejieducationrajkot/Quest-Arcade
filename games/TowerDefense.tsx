
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question, Enemy } from '../types';
import QuestionOverlay from './components/QuestionOverlay';
import { getQuestionsForGrade } from '../QuestionBank';
import { Shield } from 'lucide-react';
import { ENEMIES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseMenu } from './components/PauseMenu';

interface TowerDefenseProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

interface ActiveEnemy extends Enemy {
    instanceId: string;
    distance: number; // 100 to 0
    avatar: string;
}

const TowerDefense: React.FC<TowerDefenseProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wave, setWave] = useState(1);
  const [activeEnemies, setActiveEnemies] = useState<ActiveEnemy[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [projectile, setProjectile] = useState<{start: number, end: number} | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  
  const [startTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Load Questions
  useEffect(() => {
      if (customQuestions && customQuestions.length > 0) {
        setQuestions(customQuestions);
      } else {
        if (!student) return;
        const qs = getQuestionsForGrade(student.grade);
        setQuestions(qs.sort(() => Math.random() - 0.5));
      }
  }, [student, customQuestions]);

  // Spawn Enemies
  useEffect(() => {
      if (isGameOver || isPaused) return;
      
      const spawnInterval = setInterval(() => {
          if (activeEnemies.length < 3) {
              const baseEnemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
              setActiveEnemies(prev => [...prev, {
                  ...baseEnemy,
                  instanceId: Math.random().toString(),
                  distance: 100,
                  avatar: baseEnemy.avatar
              }]);
          }
      }, 4000); // Spawn every 4s

      const moveInterval = setInterval(() => {
          setActiveEnemies(prev => {
              const next = prev.map(e => ({ ...e, distance: e.distance - 0.5 }));
              
              // Check hit (Visual only now)
              const hitters = next.filter(e => e.distance <= 10);
              if (hitters.length > 0) {
                  setStreak(0);
                  // Remove hitters after impact
                  return next.filter(e => e.distance > 10);
              }
              return next;
          });
      }, 100);

      return () => {
          clearInterval(spawnInterval);
          clearInterval(moveInterval);
      };
  }, [activeEnemies.length, isGameOver, isPaused]);

  // Question Logic
  useEffect(() => {
      if (activeEnemies.length > 0 && !showQuestion && !isGameOver && !isPaused) {
          setShowQuestion(true);
      }
  }, [activeEnemies.length, showQuestion, isGameOver, isPaused]);

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
      setShowQuestion(false);
      
      if (isCorrect) {
          setScore(prev => prev + 100 + (streak * 10));
          setStreak(prev => prev + 1);
          setCorrectCount(prev => prev + 1);
          
          // Attack closest enemy
          const closest = activeEnemies.sort((a,b) => a.distance - b.distance)[0];
          if (closest) {
              setProjectile({ start: 10, end: closest.distance });
              setTimeout(() => {
                  setProjectile(null);
                  setActiveEnemies(prev => prev.filter(e => e.instanceId !== closest.instanceId));
              }, 500);
          }
      } else {
          setStreak(0);
          // Visual shake or red flash could go here
      }
      
      // Check for completion
      if (currentQIndex + 1 >= questions.length) {
          setIsGameOver(true);
          onGameOver({
              score,
              streak,
              questionsAnswered: questions.length,
              correctAnswers: correctCount + (isCorrect ? 1 : 0),
              timeElapsed: (Date.now() - startTime) / 1000,
              level: wave
          });
      } else {
          // Next question prep
          setCurrentQIndex(prev => (prev + 1) % questions.length);
          // Small delay before next question
          setTimeout(() => {
             if (!isGameOver) setShowQuestion(true);
          }, 1500);
      }
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setWave(1);
    setActiveEnemies([]);
    setCurrentQIndex(0);
    setIsGameOver(false);
    setCorrectCount(0);
    setIsPaused(false);
  };

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex flex-col">
       <PauseMenu 
         onQuit={onExit || (() => {})} 
         onRestart={handleRestart}
         onResume={() => setIsPaused(false)}
       />

       {/* Sky & Ground */}
       <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 to-slate-800"></div>
       <div className="absolute bottom-0 w-full h-1/3 bg-[#2a2a2a]"></div>

       {/* HUD */}
       <div className="absolute top-4 left-20 right-4 flex justify-between z-20 text-white">
           <div className="flex items-center gap-4">
               <div className="bg-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg">
                   <Shield className="fill-white" /> Wave {wave}
               </div>
           </div>
           <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-black shadow-lg">
               <motion.span 
                 key={score}
                 initial={{ scale: 1.5 }}
                 animate={{ scale: 1 }}
               >
                 {score}
               </motion.span>
           </div>
       </div>

       {/* Castle */}
       <div className="absolute bottom-10 left-4 w-32 h-64 bg-slate-700 rounded-t-xl z-10 border-4 border-slate-600 flex flex-col items-center justify-end">
            <div className="absolute -top-10 w-40 h-10 bg-slate-800 rounded flex justify-between px-2">
                <div className="w-4 h-8 bg-slate-800 -mt-8"></div>
                <div className="w-4 h-8 bg-slate-800 -mt-8"></div>
                <div className="w-4 h-8 bg-slate-800 -mt-8"></div>
            </div>
            <div className="text-6xl mb-4">{student?.avatar}</div>
            <div className="w-full h-20 bg-slate-800 border-t border-slate-600"></div>
       </div>

       {/* Enemies */}
       <div className="absolute inset-0 pointer-events-none">
           <AnimatePresence>
           {activeEnemies.map(enemy => (
               <motion.div 
                 key={enemy.instanceId}
                 initial={{ opacity: 0, x: '100%' }}
                 animate={{ opacity: 1, left: `${enemy.distance}%` }}
                 exit={{ opacity: 0, scale: 0 }}
                 className="absolute bottom-16 transform -translate-x-1/2 flex flex-col items-center"
                 style={{ transition: 'left 0.1s linear' }}
               >
                   <span className="text-5xl">{enemy.avatar}</span>
                   <div className="w-12 h-1 bg-red-900 mt-1 rounded-full overflow-hidden">
                       <div className="w-full h-full bg-red-500"></div>
                   </div>
               </motion.div>
           ))}
           </AnimatePresence>
       </div>

       {/* Projectile */}
       {projectile && (
           <motion.div 
             initial={{ left: '10%', bottom: '20%' }}
             animate={{ left: `${projectile.end}%`, bottom: '20%' }}
             transition={{ duration: 0.5 }}
             className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_yellow] z-10"
           />
       )}

       {/* Question */}
       {showQuestion && questions[currentQIndex] && !isPaused && (
           <div className="absolute inset-0 z-30">
               <QuestionOverlay 
                 question={questions[currentQIndex]} 
                 onAnswer={handleAnswer} 
                 streak={streak} 
               />
           </div>
       )}
    </div>
  );
};

export default TowerDefense;
