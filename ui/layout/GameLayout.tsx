
import React, { ReactNode } from 'react';
import IconButton from '../controls/IconButton';
import LevelBadge from '../hud/LevelBadge';
import XPBar from '../hud/XPBar';
import { Pause, Zap } from 'lucide-react';

interface GameLayoutProps {
  children: ReactNode;
  onPause: () => void;
  level: number;
  currentXP: number;
  maxXP: number;
  lives?: number; // Kept for type compatibility but unused
  streak: number;
  score: number;
}

const GameLayout: React.FC<GameLayoutProps> = ({ 
  children, 
  onPause, 
  level, 
  currentXP, 
  maxXP, 
  streak,
  score
}) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex items-start justify-between pointer-events-none safe-area-top">
        
        {/* Left: Pause & Level */}
        <div className="flex items-start gap-3 pointer-events-auto">
          <IconButton onClick={onPause} icon={<Pause size={24} />} label="Pause Game" className="mt-1" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-900/50 backdrop-blur-md p-2 pr-4 rounded-[2rem] border border-white/10 shadow-lg">
            <LevelBadge level={level} />
            <div className="pt-1 sm:pt-0">
              <XPBar current={currentXP} max={maxXP} level={level} />
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Score */}
          <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/20 text-white font-black text-2xl shadow-lg tracking-widest tabular-nums">
            {score.toLocaleString()}
          </div>

          <div className="flex gap-2">
             {/* Streak */}
             {streak > 1 && (
               <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-orange-500/30 text-orange-100 font-bold animate-pulse shadow-sm">
                 <Zap size={18} fill="currentColor" className="text-orange-500" /> {streak}x
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <main className="w-full h-full absolute inset-0">
        {children}
      </main>
    </div>
  );
};

export default GameLayout;
