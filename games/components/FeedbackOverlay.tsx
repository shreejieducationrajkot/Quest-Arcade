// games/components/FeedbackOverlay.tsx

import React from 'react';

interface FeedbackOverlayProps {
  isCorrect: boolean;
  streak: number;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ isCorrect, streak }) => {
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300
                 ${isCorrect ? 'bg-green-500/80' : 'bg-red-500/80'}`}
    >
      <div className="text-center animate-scale-in">
        {/* Emoji */}
        <div className="text-8xl mb-4 animate-bounce">
          {isCorrect ? '🎉' : '😢'}
        </div>
        
        {/* Text */}
        <div className="text-5xl font-bold text-white drop-shadow-lg">
          {isCorrect ? 'CORRECT!' : 'WRONG!'}
        </div>
        
        {/* Streak bonus */}
        {isCorrect && streak > 0 && (
          <div className="mt-4 text-2xl text-yellow-300 font-bold animate-pulse">
            🔥 {streak + 1}x Streak! +{(streak + 1) * 10} bonus!
          </div>
        )}

        {/* Confetti effect for correct answers */}
        {isCorrect && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                {['🎊', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out forwards;
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FeedbackOverlay;