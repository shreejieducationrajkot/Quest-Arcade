import React, { useState, useEffect } from 'react';
import { GameProps } from './types';
import { Heart, Trophy, Zap, Target } from 'lucide-react';

const ArcherGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'aiming' | 'shooting' | 'hit' | 'crushed'>('aiming');
  const [arrowAngle, setArrowAngle] = useState(0);

  const handleSelect = (index: number) => {
    if (gameState !== 'aiming') return;
    setSelected(index);
    setGameState('shooting');

    // Calculate fake angle for visual effect
    setArrowAngle(index === 0 ? -15 : index === 1 ? -5 : index === 2 ? 5 : 15);

    setTimeout(() => {
      if (index === question.correctAnswer) {
        setGameState('hit');
        setTimeout(() => onAnswer(true), 1500);
      } else {
        setGameState('crushed');
        setTimeout(() => onAnswer(false), 2000);
      }
    }, 600);
  };

  return (
    <div className="w-full h-full bg-stone-900 rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-stone-700">
      <style>{`
        @keyframes shoot {
          0% { left: 15%; top: 60%; opacity: 1; }
          100% { left: 85%; top: 50%; opacity: 0; }
        }
        @keyframes crush {
          0% { transform: translateY(-300px); }
          60% { transform: translateY(0); }
          70% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shoot { animation: shoot 0.5s linear forwards; }
        .animate-crush { animation: crush 0.4s ease-in forwards; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="bg-stone-800 p-4 flex justify-between items-center text-white z-10 shadow-md">
        <div className="flex gap-4">
          <div className="flex items-center gap-1"><Heart className="text-red-500 fill-red-500" size={20} /> {lives}</div>
          <div className="flex items-center gap-1"><Trophy className="text-yellow-500" size={20} /> {score}</div>
        </div>
        <div className="font-bold text-stone-400">Q {questionNumber}/{totalQuestions}</div>
        <div className={`flex items-center gap-1 ${streak > 1 ? 'text-orange-500 animate-pulse' : 'text-stone-600'}`}>
          <Zap size={20} fill="currentColor" /> {streak}
        </div>
      </div>

      {/* Game Area */}
      <div className={`flex-1 relative overflow-hidden bg-stone-800 ${gameState === 'crushed' ? 'animate-shake' : ''}`}>
        
        {/* Background Details */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-stone-500 to-transparent"></div>

        {/* Trap */}
        <div className={`absolute left-[10%] top-[20%] w-32 z-20 transition-all duration-300 ${gameState === 'crushed' ? 'top-[58%]' : ''}`}>
          <div className={`w-1 h-32 bg-black mx-auto ${gameState === 'crushed' ? 'opacity-0' : 'opacity-100'}`}></div>
          <div className="w-32 h-20 bg-stone-700 border-b-4 border-red-900 relative rounded-b-lg shadow-xl">
             <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent opacity-50"></div>
             {/* Spikes */}
             <div className="absolute -bottom-4 left-0 right-0 flex justify-between px-2">
                {[1,2,3,4].map(i => <div key={i} className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-stone-500"></div>)}
             </div>
          </div>
        </div>

        {/* Stickman */}
        <div className={`absolute left-[15%] bottom-[20%] text-6xl transition-transform duration-100 ${gameState === 'crushed' ? 'scale-y-[0.1] translate-y-10 text-red-700' : ''}`}>
           {gameState === 'aiming' ? '🏹' : gameState === 'crushed' ? '💀' : '🧍'}
        </div>

        {/* Arrow */}
        {gameState === 'shooting' && (
          <div className="absolute text-4xl animate-shoot" style={{ transform: `rotate(${arrowAngle}deg)` }}>
            ➵
          </div>
        )}

        {/* Question Board */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-3/4 text-center z-10">
           <div className="bg-stone-100 p-6 rounded-lg shadow-lg border-4 border-stone-300 transform rotate-1">
              <h2 className="text-xl md:text-2xl font-black text-stone-800">{question.text}</h2>
           </div>
        </div>

        {/* Targets */}
        <div className="absolute right-10 bottom-20 flex flex-col gap-4">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={gameState !== 'aiming'}
              className={`
                relative w-64 p-4 rounded-r-xl border-l-4 transition-all duration-200 text-left font-bold shadow-lg
                ${selected === idx 
                   ? (gameState === 'hit' ? 'bg-green-500 text-white border-green-700 scale-105' : 
                      gameState === 'crushed' ? 'bg-red-500 text-white border-red-700 shake' : 'bg-stone-200 border-stone-400')
                   : 'bg-white hover:bg-stone-50 border-stone-300 hover:scale-105'}
              `}
            >
              <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-stone-800 rounded-full border-4 border-white flex items-center justify-center text-white shadow-md">
                 {String.fromCharCode(65 + idx)}
              </div>
              <span className="ml-6 block truncate">{opt}</span>
              
              {/* Hit Effect */}
              {selected === idx && gameState === 'hit' && (
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl animate-bounce">🎯</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArcherGame;
