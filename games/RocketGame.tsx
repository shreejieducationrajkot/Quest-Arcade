import React, { useState } from 'react';
import { GameProps } from './types';
import { Heart, Trophy, Rocket, Star } from 'lucide-react';

const RocketGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [launchState, setLaunchState] = useState<'idle' | 'launching' | 'crash'>('idle');

  const handleSelect = (index: number) => {
    if (launchState !== 'idle') return;
    setSelected(index);
    
    const isCorrect = index === question.correctAnswer;
    setLaunchState(isCorrect ? 'launching' : 'crash');

    setTimeout(() => {
      onAnswer(isCorrect);
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-slate-900 rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-slate-700">
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes launch {
          0% { bottom: 20px; transform: scale(1); }
          10% { bottom: 10px; transform: scale(0.9); }
          100% { bottom: 600px; transform: scale(1); }
        }
        @keyframes explode {
          0% { transform: scale(1) rotate(0); opacity: 1; }
          100% { transform: scale(2) rotate(180deg); opacity: 0; }
        }
        @keyframes shake {
           0%, 100% { transform: translateX(0); }
           25% { transform: translateX(-10px); }
           75% { transform: translateX(10px); }
        }
        .stars { animation: twinkle 2s infinite ease-in-out; }
        .rocket-launch { animation: launch 1.5s ease-in forwards; }
        .rocket-crash { animation: explode 0.5s ease-out forwards; }
        .screen-shake { animation: shake 0.5s linear; }
      `}</style>

      {/* Stars Background */}
      <div className="absolute inset-0">
         {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-white rounded-full stars"
              style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 3}px`,
                  height: `${Math.random() * 3}px`,
                  animationDelay: `${Math.random() * 2}s`
              }}
            />
         ))}
      </div>

      {/* Header */}
      <div className="relative z-20 flex justify-between p-4 text-white">
        <div className="flex gap-4">
           <div className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-full flex gap-2"><Heart className="text-red-500 fill-red-500" /> {lives}</div>
           <div className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-full flex gap-2"><Trophy className="text-yellow-400" /> {score}</div>
        </div>
        <div className="bg-slate-800 border border-slate-600 px-3 py-1 rounded-full">{questionNumber}/{totalQuestions}</div>
      </div>

      {/* Question */}
      <div className="relative z-10 mt-10 px-6 text-center">
         <div className="bg-slate-800/80 backdrop-blur border-2 border-indigo-500 p-6 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
            <h2 className="text-2xl font-bold text-white">{question.text}</h2>
         </div>
      </div>

      {/* Rocket & Launchpad */}
      <div className={`absolute bottom-0 left-0 right-0 h-full pointer-events-none z-0 ${launchState === 'crash' ? 'screen-shake' : ''}`}>
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 transition-all duration-300 text-8xl ${launchState === 'launching' ? 'rocket-launch' : ''}`}>
             {launchState === 'crash' ? '💥' : '🚀'}
             {launchState === 'launching' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 text-4xl mt-[-20px] animate-pulse">🔥</div>
             )}
          </div>
          
          {/* Ground */}
          <div className="absolute bottom-0 w-full h-4 bg-slate-700"></div>
      </div>

      {/* Options - Launch Buttons */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 px-4 z-20">
         {question.options.map((opt, idx) => (
            <button
               key={idx}
               onClick={() => handleSelect(idx)}
               disabled={launchState !== 'idle'}
               className={`
                  flex-1 py-6 rounded-xl font-bold text-white transition-all shadow-lg border-b-4 active:border-b-0 active:translate-y-1
                  ${selected === idx 
                     ? (launchState === 'launching' ? 'bg-green-600 border-green-800' : 'bg-red-600 border-red-800')
                     : 'bg-indigo-600 border-indigo-800 hover:bg-indigo-500'}
               `}
            >
               <div className="text-xs opacity-70 mb-1">OPTION {String.fromCharCode(65+idx)}</div>
               <div className="text-lg leading-tight">{opt}</div>
            </button>
         ))}
      </div>

    </div>
  );
};

export default RocketGame;
