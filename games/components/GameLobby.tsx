
import React from 'react';
import { GAME_MODES } from '../../constants';
import { GameModeType } from '../../types';
import { Play, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameLobbyProps {
  onSelectGame: (mode: GameModeType) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

const getModeIcon = (iconName: string) => {
    switch(iconName) {
        case 'mountain': return '🏔️';
        case 'castle': return '🏰';
        case 'target': return '🏹';
        case 'trophy': return '⚽';
        case 'bubble': return '🫧';
        case 'brain': return '🧠';
        case 'basket': return '🧺';
        case 'timer': return '⏱️';
        case 'skull': return '☠️';
        case 'sword': return '⚔️';
        case 'diver': return '🤿';
        case 'dragon': return '🐉';
        case 'maze': return '🌀';
        case 'zoo': return '🦁';
        case 'flower': return '🌻';
        case 'ghost': return '👾';
        case 'rocket': return '🚀';
        case 'car': return '🏎️';
        case 'magnify': return '🔍';
        case 'puzzle': return '🧩';
        case 'chef': return '👨‍🍳';
        default: return '🎮';
    }
};

const MotionDiv = motion.div as any;
const MotionH1 = motion.h1 as any;
const MotionP = motion.p as any;
const MotionSpan = motion.span as any;
const MotionButton = motion.button as any;

const GameLobby: React.FC<GameLobbyProps> = ({ onSelectGame }) => {
  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest mb-6"
        >
          <Sparkles size={16} /> <span>Diagnostic Engine v3.0</span>
        </MotionDiv>
        <MotionH1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 mb-4 drop-shadow-sm"
        >
          Quest Arcade
        </MotionH1>
        <MotionP 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed"
        >
          Choose your favorite mission and master new skills through high-stakes arcade play!
        </MotionP>
      </div>

      <MotionDiv 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {GAME_MODES.map((mode) => (
          <MotionDiv 
            key={mode.id}
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer border border-slate-100 flex flex-col h-full hover:shadow-2xl transition-all"
            onClick={() => onSelectGame(mode.id)}
          >
            <div className={`h-40 bg-gradient-to-br ${mode.color} flex items-center justify-center relative overflow-hidden`}>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
               <MotionSpan 
                 className="text-8xl filter drop-shadow-2xl relative z-10"
                 whileHover={{ rotate: [-5, 5, -5, 0], scale: 1.1 }}
                 transition={{ type: "spring", stiffness: 300 }}
               >
                 {getModeIcon(mode.icon)}
               </MotionSpan>
            </div>

            <div className="p-8 flex flex-col flex-1">
              <h3 className="text-2xl font-black text-slate-800 mb-2">{mode.title}</h3>
              <p className="text-slate-400 mb-8 text-sm font-bold leading-relaxed flex-1 italic">
                "{mode.description}"
              </p>
              
              <MotionButton 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-2 transition-all bg-slate-900 group-hover:bg-indigo-600 shadow-lg shadow-slate-200"
              >
                <Play size={20} fill="currentColor" /> PLAY MISSION
              </MotionButton>
            </div>
          </MotionDiv>
        ))}
      </MotionDiv>

      <footer className="mt-20 py-10 border-t border-slate-200 text-center">
        <p className="text-slate-400 font-bold text-sm tracking-widest flex items-center justify-center gap-2">
          POWERED BY <span className="text-indigo-600 font-black">GEMINI AI</span> • LEARNING DIAGNOSTICS
        </p>
      </footer>
    </div>
  );
};

export default GameLobby;
