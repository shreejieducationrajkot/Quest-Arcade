
import React from 'react';
import { Question } from '../types';
import { motion } from 'framer-motion';
import { Sword, Zap, Brain, Sparkles } from 'lucide-react';

interface AttackPadProps {
  question: Question;
  onAttack: (index: number) => void;
  disabled: boolean;
  specialCharge: number;
  onSpecialAttack: () => void;
}

const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const AttackPad: React.FC<AttackPadProps> = ({ question, onAttack, disabled, specialCharge, onSpecialAttack }) => {
  const isSpecialReady = specialCharge >= 100;

  return (
    <div className="bg-slate-900 border-t-4 border-indigo-500 p-4 md:p-6 pb-8 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Question Box */}
            <div className="flex-1 bg-slate-800 rounded-xl p-4 border-l-4 border-yellow-400 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="text-yellow-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Brain size={12} /> {question.skill}
                    </span>
                    <span className="text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                    <Sword size={12} /> DMG: {question.damage}
                    </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white leading-relaxed relative z-10">
                    {question.text}
                </h2>
            </div>

            {/* Special Ability Section */}
            <div className="w-full md:w-48 bg-slate-800 rounded-xl p-3 border border-slate-700 flex flex-col justify-center gap-2">
                 <div className="flex justify-between text-xs font-bold text-cyan-300 uppercase">
                     <span>Special Charge</span>
                     <span>{Math.floor(specialCharge)}%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                     <MotionDiv 
                        className={`h-full ${isSpecialReady ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500' : 'bg-cyan-500'}`}
                        animate={{ 
                            width: `${specialCharge}%`,
                            backgroundPosition: isSpecialReady ? ['0% 0%', '100% 0%'] : '0% 0%'
                        }}
                        transition={isSpecialReady ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
                        style={{ backgroundSize: '200% 100%' }}
                     />
                 </div>
                 <MotionButton
                   whileHover={isSpecialReady ? { scale: 1.05 } : {}}
                   whileTap={isSpecialReady ? { scale: 0.95 } : {}}
                   onClick={onSpecialAttack}
                   disabled={!isSpecialReady || disabled}
                   className={`
                      w-full py-2 rounded-lg font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                      ${isSpecialReady 
                        ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.6)] animate-pulse cursor-pointer hover:bg-purple-500' 
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}
                   `}
                 >
                     <Sparkles size={16} /> Ultimate
                 </MotionButton>
            </div>
        </div>

        {/* Attack Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {question.options.map((option, idx) => (
            <MotionButton
              key={idx}
              whileHover={!disabled ? { scale: 1.02, backgroundColor: '#4f46e5' } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              onClick={() => !disabled && onAttack(idx)}
              disabled={disabled}
              className={`
                relative overflow-hidden group p-4 rounded-xl text-left font-bold text-lg transition-all
                ${disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-700 text-white hover:shadow-lg hover:shadow-indigo-500/20 border-2 border-slate-600 hover:border-indigo-400'}
              `}
            >
              <div className="flex items-center gap-3 relative z-10">
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black
                  ${disabled ? 'bg-slate-900 text-slate-600' : 'bg-slate-900 text-indigo-400 group-hover:bg-white group-hover:text-indigo-600'}
                `}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>
              
              {/* Shine effect on hover */}
              {!disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              )}
            </MotionButton>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttackPad;
