
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import QuestionOverlay from './components/QuestionOverlay';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Circle, Star, Zap } from 'lucide-react';
import { useSound } from './components/SoundManager';

interface ZooBuilderProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
}

interface ZooItem {
  id: string;
  type: string;
  emoji: string;
  gridIndex: number;
}

const ANIMALS = [
  { type: 'Lion', emoji: '🦁', cost: 200 },
  { type: 'Panda', emoji: '🐼', cost: 150 },
  { type: 'Elephant', emoji: '🐘', cost: 300 },
  { type: 'Monkey', emoji: '🐒', cost: 100 },
  { type: 'Zebra', emoji: '🦓', cost: 180 },
  { type: 'Penguin', emoji: '🐧', cost: 120 },
];

const MotionSpan = motion.span as any;
const MotionDiv = motion.div as any;

const ZooBuilder: React.FC<ZooBuilderProps> = ({ student, customQuestions, onGameOver }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [zooItems, setZooItems] = useState<ZooItem[]>([]);
  const [showQuestion, setShowQuestion] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [startTime] = useState(Date.now());
  const { playSound } = useSound();

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 12));
    }
  }, [student.grade, customQuestions]);

  const handleAnswer = (isCorrect: boolean, timeTaken: number) => {
    setShowQuestion(false);
    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 100);
      setCoins(c => c + 100 + (streak * 10));
      setStreak(st => st + 1);
    } else {
      playSound('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        onGameOver({
          score,
          streak,
          questionsAnswered: currentIndex + 1,
          correctAnswers: Math.floor(score / 100),
          timeElapsed: (Date.now() - startTime) / 1000,
          level: zooItems.length
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowQuestion(true);
      }
    }, 1500);
  };

  const buyAnimal = (animal: typeof ANIMALS[0]) => {
    if (coins < animal.cost) return;
    playSound('click');
    setCoins(c => c - animal.cost);
    const availableIndices = Array.from({ length: 16 }, (_, i) => i).filter(i => !zooItems.some(item => item.gridIndex === i));
    if (availableIndices.length === 0) return;
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setZooItems([...zooItems, { id: Math.random().toString(), type: animal.type, emoji: animal.emoji, gridIndex: randomIndex }]);
  };

  return (
    <div className="relative w-full h-full bg-emerald-50 flex flex-col items-center p-6 overflow-hidden">
      <div className="z-10 w-full max-w-5xl flex justify-between items-center mb-8">
        <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border-2 border-emerald-100 flex items-center gap-4">
           <div className="flex flex-col">
             <span className="text-[10px] font-black text-emerald-600 uppercase">Your Zoo Money</span>
             <div className="flex items-center gap-2 text-2xl font-black text-amber-600">
               <Circle className="fill-amber-500" size={20} /> {coins}
             </div>
           </div>
        </div>
        <div className="flex gap-2">
           {ANIMALS.map(a => (
             <button 
               key={a.type}
               onClick={() => buyAnimal(a)}
               disabled={coins < a.cost}
               className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${coins >= a.cost ? 'bg-white border-emerald-400 hover:scale-105' : 'bg-slate-100 border-slate-200 opacity-50 grayscale'}`}
             >
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-[10px] font-bold">${a.cost}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Zoo Grid */}
        <div className="bg-emerald-200 p-4 rounded-[2.5rem] shadow-inner border-4 border-emerald-300 relative aspect-square">
            <div className="grid grid-cols-4 grid-rows-4 gap-2 h-full">
              {Array.from({ length: 16 }).map((_, i) => {
                const item = zooItems.find(zi => zi.gridIndex === i);
                return (
                  <div key={i} className="bg-emerald-100/50 rounded-2xl flex items-center justify-center text-4xl shadow-sm border border-emerald-200/50">
                    <AnimatePresence>
                      {item && (
                        <MotionSpan initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          {item.emoji}
                        </MotionSpan>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-xs font-black text-emerald-800 shadow-md">
              {student.name}'S SAFARI PARK
            </div>
        </div>

        {/* Question Area */}
        <div className="h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {showQuestion ? (
              <MotionDiv key="q" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} className="w-full">
                <QuestionOverlay question={questions[currentIndex]} onAnswer={handleAnswer} streak={streak} />
              </MotionDiv>
            ) : (
              <MotionDiv key="wait" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center text-emerald-800 font-black">
                <Sparkles size={64} className="mx-auto mb-4 animate-bounce text-amber-500" />
                <p className="text-xl">Processing Answer...</p>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ZooBuilder;
