import React, { useState } from 'react';
import { GameProps } from './types';
import { Heart, Trophy, Shovel } from 'lucide-react';

const TreasureGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    
    const isCorrect = index === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 1200);
  };

  return (
    <div className="w-full h-full bg-amber-100 rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-amber-300">
      <style>{`
        @keyframes dig {
          0% { transform: rotate(0); }
          50% { transform: rotate(-45deg) translateY(10px); }
          100% { transform: rotate(0); }
        }
        @keyframes rise {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(-30px); opacity: 1; }
        }
        .animate-dig { animation: dig 0.5s ease-in-out; }
        .animate-rise { animation: rise 0.5s ease-out forwards 0.5s; }
      `}</style>

      {/* Header */}
      <div className="bg-amber-600 p-4 flex justify-between items-center text-white z-20 shadow-md">
        <div className="flex gap-4">
           <div className="flex items-center gap-1 font-bold"><Heart className="text-red-500 fill-red-500" /> {lives}</div>
           <div className="flex items-center gap-1 font-bold"><Trophy className="text-yellow-300" /> {score}</div>
        </div>
        <div className="font-bold text-amber-200">ISLAND {questionNumber}</div>
      </div>

      {/* Map/Question */}
      <div className="p-6 text-center z-10 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] bg-amber-50 m-4 rounded-xl border-2 border-amber-800 shadow-inner transform -rotate-1">
         <h2 className="text-xl font-bold text-amber-900 font-serif">{question.text}</h2>
         <div className="text-xs text-amber-700 mt-2 uppercase tracking-widest font-bold">X Marks The Spot</div>
      </div>

      {/* Sand Piles */}
      <div className="flex-1 grid grid-cols-2 gap-6 p-6 items-end pb-10">
         {question.options.map((opt, idx) => (
            <button
               key={idx}
               onClick={() => handleSelect(idx)}
               disabled={selected !== null}
               className="relative group flex flex-col items-center justify-end h-32"
            >
               {/* Shovel Icon on Hover */}
               {selected === null && (
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-stone-600">
                     <Shovel size={32} />
                  </div>
               )}

               {/* Result Reveal */}
               {selected === idx && (
                  <div className="absolute bottom-10 text-5xl animate-rise z-0">
                     {idx === question.correctAnswer ? '💎' : '🦀'}
                  </div>
               )}

               {/* Sand Pile */}
               <div className={`
                  w-32 h-16 bg-amber-300 rounded-t-full relative z-10 flex items-center justify-center transition-transform
                  border-b-8 border-amber-400/50 shadow-lg
                  ${selected === idx ? 'scale-y-50 translate-y-4' : 'group-hover:scale-105'}
               `}>
                  <span className="font-bold text-amber-800 drop-shadow-sm px-2 text-sm text-center leading-tight">
                    {opt}
                  </span>
               </div>
               
               {/* Dig Effect */}
               {selected === idx && (
                  <div className="absolute top-0 right-0 text-4xl animate-dig z-20">
                     ⛏️
                  </div>
               )}
            </button>
         ))}
      </div>

      {/* Sea Background */}
      <div className="absolute bottom-0 w-full h-8 bg-blue-400"></div>
      <div className="absolute bottom-2 w-full h-8 bg-blue-300 rounded-t-full opacity-50"></div>
    </div>
  );
};

export default TreasureGame;
