// games/components/StreakBanner.tsx

import React from 'react';

interface StreakBannerProps {
  streak: number;
}

const StreakBanner: React.FC<StreakBannerProps> = ({ streak }) => {
  const getMessage = () => {
    if (streak >= 10) return { text: 'LEGENDARY!', emoji: '👑', color: 'from-yellow-400 to-amber-600' };
    if (streak >= 7) return { text: 'ON FIRE!', emoji: '🔥', color: 'from-orange-400 to-red-600' };
    if (streak >= 5) return { text: 'AMAZING!', emoji: '⚡', color: 'from-purple-400 to-pink-600' };
    if (streak >= 3) return { text: 'GREAT!', emoji: '✨', color: 'from-blue-400 to-indigo-600' };
    return { text: 'NICE!', emoji: '👍', color: 'from-green-400 to-emerald-600' };
  };

  const { text, emoji, color } = getMessage();

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 animate-streak-banner">
      <div className={`bg-gradient-to-r ${color} px-8 py-4 rounded-2xl shadow-2xl
                      flex items-center gap-4 text-white font-bold`}>
        <span className="text-4xl animate-bounce">{emoji}</span>
        <div className="text-center">
          <div className="text-3xl">{streak}x STREAK!</div>
          <div className="text-lg opacity-90">{text}</div>
        </div>
        <span className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>{emoji}</span>
      </div>

      <style>{`
        @keyframes streak-banner {
          0% { transform: translate(-50%, -100px) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, 0) scale(1.1); opacity: 1; }
          80% { transform: translate(-50%, 0) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -100px) scale(0.5); opacity: 0; }
        }
        .animate-streak-banner {
          animation: streak-banner 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StreakBanner;