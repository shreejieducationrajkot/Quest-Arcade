
import React from 'react';
import { Timer } from 'lucide-react';

interface TimerHUDProps {
  time: number; // in seconds
  warning?: boolean;
}

const TimerHUD: React.FC<TimerHUDProps> = ({ time, warning = false }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={`
      flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md border-2 font-mono font-black text-lg shadow-lg transition-colors duration-300
      ${warning 
        ? 'bg-red-500/20 border-red-500 text-red-100 animate-[pulse_1s_ease-in-out_infinite]' 
        : 'bg-slate-800/40 border-slate-600/50 text-white'}
    `}>
      <Timer size={20} className={warning ? 'animate-bounce' : ''} />
      <span>{display}</span>
    </div>
  );
};

export default TimerHUD;
