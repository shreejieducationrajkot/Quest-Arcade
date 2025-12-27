import React, { useState } from 'react';
import { GameProps } from './types';
import { Heart, Trophy } from 'lucide-react';

const BalloonGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    
    const isCorrect = index === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 800);
  };

  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'
  ];

  return (
    <div className="w-full h-full bg-sky-300 rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-sky-600">
      <style>{`
        @keyframes float-balloon {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        @keyframes pop-balloon {
           0% { transform: scale(1); opacity: 1; }
           50% { transform: scale(1.2); opacity: 0.8; }
           100% { transform: scale(0); opacity: 0; }
        }
        .anim-float { animation: float-balloon 4s ease-in-out infinite; }
        .anim-pop { animation: pop-balloon 0.2s ease-out forwards; }
      `}</style>

      {/* Clouds */}
      <div className="absolute top-10 left-10 text-6xl opacity-80 text-white">☁️</div>
      <div className="absolute top-20 right-20 text-4xl opacity-60 text-white">☁️</div>

      {/* Header */}
      <div className="relative z-20 flex justify-between p-4">
        <div className="flex gap-4">
           <div className="bg-white/50 px-3 py-1 rounded-full flex gap-2 font-bold text-slate-700"><Heart className="text-red-500 fill-red-500" /> {lives}</div>
           <div className="bg-white/50 px-3 py-1 rounded-full flex gap-2 font-bold text-slate-700"><Trophy className="text-yellow-500 fill-yellow-500" /> {score}</div>
        </div>
      </div>

      {/* Question */}
      <div className="relative z-10 mt-4 mx-6 text-center">
         <div className="bg-white p-6 rounded-2xl shadow-xl border-b-8 border-slate-200">
            <h2 className="text-2xl font-black text-slate-800">{question.text}</h2>
         </div>
      </div>

      {/* Balloons */}
      <div className="flex-1 relative mt-8">
         {question.options.map((opt, idx) => {
            const positions = [
               { left: '10%', top: '10%' },
               { right: '10%', top: '20%' },
               { left: '20%', bottom: '10%' },
               { right: '20%', bottom: '20%' }
            ];

            return (
               <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`
                     absolute w-28 h-36 rounded-[50%] flex items-center justify-center p-2 shadow-inner
                     ${colors[idx]}
                     ${selected === idx ? 'anim-pop' : 'anim-float'}
                     transition-transform hover:scale-105 active:scale-95
                  `}
                  style={{
                     ...positions[idx],
                     animationDelay: `${idx * 0.5}s`
                  }}
               >
                  {/* Highlight */}
                  <div className="absolute top-4 left-4 w-6 h-10 bg-white/20 rounded-[50%] transform -rotate-12"></div>
                  
                  {/* String */}
                  <div className="absolute -bottom-12 left-1/2 w-0.5 h-12 bg-slate-600 origin-top transform rotate-6"></div>

                  <span className="text-white font-black text-lg text-shadow-sm leading-tight text-center relative z-10">
                     {opt}
                  </span>
               </button>
            );
         })}
         
         {selected !== null && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                 <div className="text-6xl font-black text-white drop-shadow-lg">
                    {selected === question.correctAnswer ? 'POP!' : 'BANG!'}
                 </div>
             </div>
         )}
      </div>
    </div>
  );
};

export default BalloonGame;
