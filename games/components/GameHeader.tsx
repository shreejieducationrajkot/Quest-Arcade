// games/components/GameHeader.tsx

import React from 'react';
import { PlayerProgress } from '../types/gameTypes';

interface GameHeaderProps {
  progress: PlayerProgress;
  onExit: () => void;
  onPause: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ progress, onExit, onPause }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-black/20">
      {/* Exit Button */}
      <button
        onClick={onExit}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full 
                   transition-colors flex items-center gap-2"
      >
        <span>←</span>
        <span className="hidden sm:inline">Exit</span>
      </button>

      {/* Center Stats */}
      <div className="flex items-center gap-4">
        {/* Lives */}
        <div className="flex items-center gap-1">
          {[...Array(progress.maxLives)].map((_, i) => (
            <span 
              key={i} 
              className={`text-2xl transition-all duration-300 
                         ${i < progress.lives ? 'animate-pulse' : 'opacity-30 grayscale'}`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Score */}
        <div className="bg-yellow-500/80 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2">
          <span>🏆</span>
          <span>{progress.score.toLocaleString()}</span>
        </div>

        {/* Streak */}
        {progress.streak > 0 && (
          <div className="bg-orange-500 text-white px-3 py-2 rounded-full font-bold 
                         animate-pulse flex items-center gap-1">
            <span>🔥</span>
            <span>{progress.streak}x</span>
          </div>
        )}
      </div>

      {/* Coins */}
      <div className="bg-amber-400/80 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2">
        <span>🪙</span>
        <span>{progress.coins}</span>
      </div>
    </div>
  );
};

export default GameHeader;