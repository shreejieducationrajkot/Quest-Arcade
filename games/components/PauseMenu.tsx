
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, RotateCcw, Home } from 'lucide-react';

interface PauseMenuProps {
  onPause?: () => void;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({ onPause, onResume, onRestart, onQuit }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    if (onPause) onPause();
  };

  const handleResume = () => {
    setIsOpen(false);
    onResume();
  };

  const handleRestart = () => {
    setIsOpen(false);
    onRestart();
  }

  const handleQuit = () => {
    setIsOpen(false);
    onQuit();
  }

  return (
    <>
      {/* 1. THE PAUSE BUTTON (Top Left) */}
      <button 
        onClick={handleOpen}
        className="absolute top-4 left-4 z-50 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/20 rounded-xl shadow-lg transition-all group"
        aria-label="Pause Game"
      >
        <Pause className="w-8 h-8 text-white fill-white/20" />
      </button>

      {/* 2. THE MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={handleResume}
            />

            {/* Modal Card */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl p-8 w-80 md:w-96 shadow-2xl text-center z-10"
            >
              <h2 className="text-4xl font-black text-slate-800 mb-2">Paused</h2>
              <p className="text-slate-500 font-medium mb-8">Take a breath, you're doing great!</p>

              <div className="flex flex-col gap-3">
                {/* Resume */}
                <button onClick={handleResume} className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-transform active:scale-95">
                   <Play fill="currentColor" size={20} /> Resume Game
                </button>

                {/* Restart */}
                <button onClick={handleRestart} className="w-full py-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-amber-900 font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-amber-100 transition-transform active:scale-95">
                   <RotateCcw size={20} /> Restart Level
                </button>

                {/* Quit */}
                <button onClick={handleQuit} className="w-full py-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black text-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                   <Home size={20} /> Quit to Menu
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
