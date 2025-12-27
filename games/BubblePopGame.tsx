import React, { useState } from 'react';
import { GameProps } from './types';
import { Heart, Trophy, Zap } from 'lucide-react';

const BubblePopGame: React.FC<GameProps> = ({ question, onAnswer, score, lives, streak, questionNumber, totalQuestions }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [popped, setPopped] = useState<boolean>(false);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setPopped(true);

    const isCorrect = index === question.correctAnswer;
    setTimeout(() => onAnswer(isCorrect), 1000);
  };

  const colors = [
    'bg-gradient-to-br from-cyan-300 to-blue-500',
    'bg-gradient-to-br from-pink-300 to-rose-500',
    'bg-gradient-to-br from-emerald-300 to-green-500',
    'bg-gradient-to-br from-amber-300 to-orange-500'
  ];

  return (
    <div className="w-full h-full bg-gradient-to-b from-sky-400 to-blue-900 rounded-3xl overflow-hidden relative flex flex-col font-sans select-none border-4 border-blue-900">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.8; }
          100% { transform: scale(0); opacity: 0; }
        }
        .bubble-float { animation: float 3s ease-in-out infinite; }
        .bubble-pop { animation: pop 0.3s ease-out forwards; }
      `}</style>

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md p-4 flex justify-between items-center text-white z-20">
        <div className="flex gap-4">
           <div className="bg-black/20 px-3 py-1 rounded-full flex gap-2"><Heart className="text-red-400 fill-red-400" /> {lives}</div>
           <div className="bg-black/20 px-3 py-1 rounded-full flex gap-2"><Trophy className="text-yellow-400" /> {score}</div>
        </div>
        <div className="font-bold">Q {questionNumber}/{totalQuestions}</div>
      </div>

      {/* Question Bubble */}
      <div className="mt-8 mx-auto z-10 w-3/4 max-w-lg">
         <div className="bg-white/90 backdrop-blur p-6 rounded-3xl shadow-xl text-center border-4 border-white/50 animate-bounce" style={{ animationDuration: '3s' }}>
            <h2 className="text-2xl font-black text-blue-900">{question.text}</h2>
         </div>
      </div>

      {/* Bubbles Container */}
      <div className="flex-1 relative">
         {question.options.map((opt, idx) => {
            // Calculate random positions roughly
            const positions = [
                { left: '10%', bottom: '10%' },
                { left: '60%', bottom: '20%' },
                { left: '20%', bottom: '40%' },
                { left: '70%', bottom: '50%' }
            ];
            
            const isSelected = selected === idx;
            const isCorrect = idx === question.correctAnswer;
            
            return (
               <button
                 key={idx}
                 onClick={() => handleSelect(idx)}
                 disabled={selected !== null}
                 className={`
                    absolute w-32 h-32 rounded-full flex items-center justify-center p-4 shadow-xl border-4 border-white/30 backdrop-blur-sm transition-all duration-300
                    ${colors[idx % 4]}
                    ${isSelected ? 'bubble-pop' : 'bubble-float'}
                    hover:scale-110 cursor-pointer
                 `}
                 style={{ 
                     ...positions[idx], 
                     animationDelay: `${idx * 0.5}s`,
                     zIndex: 10
                 }}
               >
                   <div className="absolute top-4 left-4 w-6 h-3 bg-white/40 rounded-full transform -rotate-45"></div>
                   <span className="text-white font-black text-lg drop-shadow-md leading-tight text-center">{opt}</span>
               </button>
            );
         })}
         
         {/* Feedback Splash */}
         {selected !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <div className={`text-6xl font-black drop-shadow-2xl animate-bounce ${selected === question.correctAnswer ? 'text-green-400' : 'text-red-500'}`}>
                    {selected === question.correctAnswer ? 'POP! 🎉' : 'OOPS! 💥'}
                </div>
            </div>
         )}
      </div>
      
      {/* Decorative Seaweed */}
      <div className="absolute bottom-0 w-full flex justify-between px-10 pointer-events-none opacity-60">
         <div className="text-6xl text-green-800 transform -translate-y-4">🌿</div>
         <div className="text-8xl text-green-900">🌿</div>
         <div className="text-5xl text-teal-800 transform -translate-y-2">🌿</div>
      </div>
    </div>
  );
};

export default BubblePopGame;
