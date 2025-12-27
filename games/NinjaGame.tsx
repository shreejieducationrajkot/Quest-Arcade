import React, { useState } from 'react';
import { GameProps } from './types';
import { Heart, Trophy, Sword } from 'lucide-react';

const NinjaGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [slashPos, setSlashPos] = useState<{x:number, y:number} | null>(null);

  const handleSelect = (index: number, e: React.MouseEvent) => {
    if (selected !== null) return;
    
    // Calculate slash position relative to container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSlashPos({ x, y });

    setSelected(index);

    const isCorrect = index === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 800);
  };

  const fruits = ['🍉', '🍊', '🥝', '🥥'];

  return (
    <div className="w-full h-full bg-[#2a2a2a] rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-stone-800 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(0px) rotate(180deg); }
          100% { transform: translateY(100px) rotate(360deg); opacity: 1; }
        }
        @keyframes slash {
           0% { width: 0; opacity: 1; }
           100% { width: 100px; opacity: 0; }
        }
        @keyframes split-left {
           0% { transform: translate(0, 0) rotate(0); }
           100% { transform: translate(-20px, 20px) rotate(-45deg); opacity: 0; }
        }
        @keyframes split-right {
           0% { transform: translate(0, 0) rotate(0); }
           100% { transform: translate(20px, 20px) rotate(45deg); opacity: 0; }
        }
        .fruit-appear { animation: float-up 3s ease-in-out infinite; }
        .slash-anim { animation: slash 0.2s linear forwards; }
        .split-l { animation: split-left 0.5s ease-out forwards; }
        .split-r { animation: split-right 0.5s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-black/50 p-4 flex justify-between items-center text-white z-20 backdrop-blur-sm">
        <div className="flex gap-4">
           <div className="flex items-center gap-1 text-red-400 font-bold"><Heart size={20} fill="currentColor"/> {lives}</div>
           <div className="flex items-center gap-1 text-yellow-400 font-bold"><Trophy size={20} /> {score}</div>
        </div>
        <div className="font-mono text-stone-300">DOJO LEVEL {questionNumber}</div>
      </div>

      {/* Question Scroll */}
      <div className="mt-8 mx-auto w-4/5 bg-[#f4e4bc] text-stone-800 p-6 rounded shadow-lg border-y-4 border-stone-400 text-center relative">
         <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-800 rounded-full"></div>
         <h2 className="text-xl font-black font-serif">{question.text}</h2>
      </div>

      {/* Targets */}
      <div className="flex-1 grid grid-cols-2 gap-4 p-8 items-center justify-items-center">
         {question.options.map((opt, idx) => (
            <button
               key={idx}
               onClick={(e) => handleSelect(idx, e)}
               disabled={selected !== null}
               className="relative group w-full h-32"
            >
               <div className={`
                  w-full h-full flex flex-col items-center justify-center transition-transform duration-300
                  ${selected === null ? 'hover:scale-110' : ''}
               `}>
                  {/* Fruit Graphic */}
                  <div className="text-6xl mb-2 relative">
                     {selected === idx ? (
                         <>
                            <div className="absolute inset-0 split-l">{fruits[idx]}</div>
                            <div className="absolute inset-0 split-r">{fruits[idx]}</div>
                         </>
                     ) : (
                         <div className="group-hover:rotate-12 transition-transform">{fruits[idx]}</div>
                     )}
                     
                     {/* Slash Effect */}
                     {selected === idx && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-white rotate-45 shadow-[0_0_10px_white]"></div>
                     )}
                  </div>
                  
                  {/* Label */}
                  <div className={`
                     px-4 py-1 rounded font-bold text-white shadow-md
                     ${selected === idx 
                        ? (idx === question.correctAnswer ? 'bg-green-600' : 'bg-red-600')
                        : 'bg-stone-700/80 backdrop-blur'}
                  `}>
                     {opt}
                  </div>
               </div>
            </button>
         ))}
      </div>
      
      {/* Decorative Sword */}
      <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
          <Sword size={120} className="text-white transform rotate-45" />
      </div>

    </div>
  );
};

export default NinjaGame;
