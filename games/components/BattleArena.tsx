
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentProfile, Enemy, BattleState } from '../../types';
import { Trophy, Zap } from 'lucide-react';
import CharacterSprite from './CharacterSprite';

interface BattleArenaProps {
  student: StudentProfile;
  enemy: Enemy;
  battleState: BattleState;
  score: number;
  streak: number;
  lastAction: { 
    type: 'damage' | 'heal' | 'miss' | null; 
    value: number; 
    target: 'player' | 'enemy';
    isCritical?: boolean;
    isUltimate?: boolean;
  };
}

type CharacterAction = 'idle' | 'walk' | 'jump' | 'attack' | 'hit' | 'win' | 'lose';

const MotionDiv = motion.div as any;

const BattleArena: React.FC<BattleArenaProps> = ({ student, enemy, battleState, lastAction, score, streak }) => {
  const [screenShake, setScreenShake] = useState(false);

  // Derived Character Actions
  const getPlayerAction = (): CharacterAction => {
    if (lastAction.type === 'damage' && lastAction.target === 'enemy') return 'attack';
    if (lastAction.type === 'damage' && lastAction.target === 'player') return 'hit';
    if (lastAction.type === 'miss' && lastAction.target === 'enemy') return 'attack'; // Tried to attack but missed
    if (battleState.message.includes('VICTORY')) return 'win';
    if (battleState.playerHp <= 0) return 'lose';
    return 'idle';
  };

  const getEnemyAction = (): CharacterAction => {
    if (lastAction.type === 'damage' && lastAction.target === 'player') return 'attack';
    if (lastAction.type === 'damage' && lastAction.target === 'enemy') return 'hit';
    if (battleState.message.includes('VICTORY')) return 'lose';
    if (enemy.hp <= 0) return 'lose';
    return 'idle';
  };

  useEffect(() => {
    if (lastAction.isUltimate) {
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 800);
    }
  }, [lastAction]);

  return (
    <div className={`relative w-full h-full flex flex-col justify-between p-4 overflow-hidden ${screenShake ? 'animate-[bounce_0.1s_infinite]' : ''}`}>
      {/* Background Ambience */}
      <div className={`absolute inset-0 -z-10 ${enemy.theme === 'cyber' ? 'bg-slate-900' : 'bg-gradient-to-b from-indigo-900 via-purple-900 to-slate-900'}`}>
        {enemy.theme === 'cyber' && (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
        )}
        {/* Floor */}
        <div className="absolute bottom-0 w-full h-1/3 bg-black/20 backdrop-blur-sm skew-x-12 origin-bottom-left transform scale-150"></div>
        
        {/* Ultimate Background Flash */}
        <AnimatePresence>
          {lastAction.isUltimate && (
             <MotionDiv 
               initial={{ opacity: 0 }}
               animate={{ opacity: [0, 0.8, 0] }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.5 }}
               className="absolute inset-0 bg-white mix-blend-overlay z-0"
             />
          )}
        </AnimatePresence>
      </div>

      {/* HUD: Score & Streak */}
      <div className="absolute top-4 left-4 z-30 flex gap-4">
         <MotionDiv 
           key={score}
           initial={{ scale: 1.2, color: '#FBBF24' }}
           animate={{ scale: 1, color: '#FFFFFF' }}
           className="bg-black/40 backdrop-blur border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-white shadow-lg"
         >
            <Trophy size={18} className="text-yellow-400" />
            <span>{score}</span>
         </MotionDiv>
         {streak > 1 && (
           <MotionDiv 
             initial={{ x: -20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             key={streak}
             className="bg-orange-600/80 backdrop-blur border border-orange-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold text-white shadow-lg animate-pulse"
           >
              <Zap size={18} className="fill-current" />
              <span>{streak}x</span>
           </MotionDiv>
         )}
      </div>

      {/* Battle Message */}
      <div className="absolute top-20 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <MotionDiv
            key={battleState.message}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`
              px-8 py-3 rounded-2xl font-black text-lg backdrop-blur-md border shadow-2xl text-center max-w-lg
              ${battleState.message.includes('ULTIMATE') 
                ? 'bg-purple-600 text-white border-purple-400 scale-110 shadow-purple-500/50'
                : battleState.message.includes('Critical') 
                ? 'bg-yellow-500 text-black border-yellow-300 scale-105 shadow-yellow-500/50' 
                : 'bg-slate-800/90 text-white border-slate-600'}
            `}
          >
            {battleState.message}
          </MotionDiv>
        </AnimatePresence>
      </div>

      {/* Visual Effects Layer (Impact Flashes) */}
      <AnimatePresence>
        {lastAction.type === 'damage' && (
          <MotionDiv
              key={`vfx-${Date.now()}`}
              initial={{ opacity: 0.8, scale: 0.2 }}
              animate={{ opacity: 0, scale: lastAction.isUltimate ? 4 : lastAction.isCritical ? 2.5 : 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className={`absolute z-40 rounded-full blur-xl pointer-events-none
                  ${lastAction.target === 'enemy' ? 'right-[20%] top-[35%]' : 'left-[20%] top-[35%]'}
                  ${lastAction.isUltimate 
                     ? 'bg-purple-500 w-[500px] h-[500px] mix-blend-screen' 
                     : lastAction.isCritical 
                     ? 'bg-yellow-300 w-64 h-64 mix-blend-screen' 
                     : 'bg-red-500 w-40 h-40 mix-blend-overlay'}
              `}
          />
        )}
      </AnimatePresence>

      {/* Floating Combat Text Overlay */}
      <AnimatePresence>
        {lastAction.type && (
          <MotionDiv
            key={Date.now()}
            initial={{ opacity: 0, y: 0, scale: 0.5, rotate: lastAction.isCritical ? -10 : 0 }}
            animate={{ opacity: 1, y: -120, scale: lastAction.isUltimate ? 2.5 : lastAction.isCritical ? 1.5 : 1, rotate: lastAction.isUltimate ? -5 : 0 }}
            exit={{ opacity: 0, y: -150 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className={`absolute z-50 font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] flex flex-col items-center pointer-events-none
              ${lastAction.target === 'enemy' ? 'right-[25%] top-[40%]' : 'left-[25%] top-[40%]'}
              ${lastAction.type === 'damage' 
                ? (lastAction.isUltimate ? 'text-purple-400 text-8xl' : lastAction.isCritical ? 'text-yellow-400 text-7xl' : 'text-red-500 text-6xl') 
                : 'text-green-500 text-5xl'}
            `}
          >
            <span style={{ textShadow: lastAction.isCritical || lastAction.isUltimate ? '0 0 20px rgba(255,255,255, 0.5)' : 'none' }}>
              {lastAction.type === 'miss' ? 'MISS' : lastAction.type === 'damage' ? `-${lastAction.value}` : `+${lastAction.value}`}
            </span>
            {lastAction.isUltimate && (
              <span className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 font-black uppercase tracking-widest px-2 -mt-4 animate-pulse">
                ULTIMATE!
              </span>
            )}
            {!lastAction.isUltimate && lastAction.isCritical && (
              <span className="text-xl text-white font-bold uppercase tracking-widest bg-red-600 px-2 rounded -mt-2 rotate-6 border border-white">
                Critical!
              </span>
            )}
          </MotionDiv>
        )}
      </AnimatePresence>


      {/* Main Battle Scene */}
      <div className="flex-1 flex items-end justify-between px-4 md:px-20 pb-12 relative max-w-6xl mx-auto w-full">
        
        {/* PLAYER AREA */}
        <div className="relative flex flex-col items-center gap-4">
          {/* Player HP Bar */}
          <div className="w-48 bg-slate-800 rounded-lg border-2 border-slate-600 p-1 relative shadow-xl">
             <div className="flex justify-between text-xs font-bold text-white mb-1 px-1">
               <span>{student.name}</span>
               <span>{Math.max(0, battleState.playerHp)}/{battleState.playerMaxHp}</span>
             </div>
             <div className="w-full h-3 bg-slate-700 rounded-sm overflow-hidden">
               <MotionDiv 
                 className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                 initial={{ width: '100%' }}
                 animate={{ width: `${(Math.max(0, battleState.playerHp) / battleState.playerMaxHp) * 100}%` }}
                 transition={{ type: "spring", stiffness: 100 }}
               />
             </div>
          </div>

          <CharacterSprite 
            avatar={student.avatar}
            action={getPlayerAction()}
            size="xl"
            direction="left"
          />
        </div>


        {/* ENEMY AREA */}
        <div className="relative flex flex-col items-center gap-4">
          {/* Enemy HP Bar */}
          <div className="w-48 bg-slate-800 rounded-lg border-2 border-slate-600 p-1 relative shadow-xl">
             <div className="flex justify-between text-xs font-bold text-white mb-1 px-1">
               <span>{enemy.name}</span>
               <span>{Math.max(0, enemy.hp)}/{enemy.maxHp}</span>
             </div>
             <div className="w-full h-3 bg-slate-700 rounded-sm overflow-hidden">
               <MotionDiv 
                 className="h-full bg-gradient-to-r from-red-500 to-orange-600"
                 initial={{ width: '100%' }}
                 animate={{ width: `${(Math.max(0, enemy.hp) / enemy.maxHp) * 100}%` }}
                 transition={{ type: "spring", stiffness: 100 }}
               />
             </div>
          </div>

          <CharacterSprite 
            avatar={enemy.avatar}
            action={getEnemyAction()}
            size="xl"
            direction="right"
          />
        </div>

      </div>
    </div>
  );
};

export default BattleArena;
