
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from './components/SoundManager';
import { Question } from '../types';

// ============================================
// TYPES
// ============================================

interface TrapRoomProps {
  question: Question;
  onComplete: (isCorrect: boolean, score: number) => void;
  currentScore?: number;
  questionNumber?: number;
  totalQuestions?: number;
}

interface Point {
  x: number;
  y: number;
  rotation: number;
}

// ============================================
// MATH HELPERS
// ============================================

const getQuadraticBezierPoint = (t: number, p0: {x:number, y:number}, p1: {x:number, y:number}, p2: {x:number, y:number}) => {
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
  const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
  return { x, y };
};

const calculateFlightPath = (start: {x:number, y:number}, end: {x:number, y:number}): Point[] => {
  const points: Point[] = [];
  const steps = 30;
  
  // Control point (Peak of the arc)
  const p1 = {
    x: (start.x + end.x) / 2,
    y: Math.min(start.y, end.y) - 150 // Arc height
  };

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pos = getQuadraticBezierPoint(t, start, p1, end);
    const nextT = Math.min(1, t + 0.01);
    const nextPos = getQuadraticBezierPoint(nextT, start, p1, end);
    const angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x) * (180 / Math.PI);
    
    points.push({ x: pos.x, y: pos.y, rotation: angle });
  }
  return points;
};

// ============================================
// COMPONENTS
// ============================================

const RoundTarget: React.FC<{
  text: string;
  index: number;
  onClick: (e: React.MouseEvent) => void;
  isHit: boolean;
  disabled: boolean;
}> = ({ text, index, onClick, isHit, disabled }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`
        group relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white shadow-lg flex items-center justify-center 
        text-sm sm:text-base font-bold text-gray-800 transition-all duration-200 border-4
        ${disabled ? 'cursor-default border-white' : 'hover:shadow-xl hover:border-indigo-200 cursor-pointer border-white'}
        ${isHit ? 'border-green-400 bg-green-50 text-green-700' : ''}
      `}
    >
      <span className="z-10 px-2 text-center leading-tight line-clamp-3">{text}</span>

      <span className={`
        absolute -top-1 -right-1 w-8 h-8 text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-colors
        ${isHit ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white group-hover:bg-indigo-500'}
      `}>
        {String.fromCharCode(65 + index)}
      </span>

      <AnimatePresence>
        {isHit && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -20 }}
            animate={{ scale: 1.2, opacity: 1, rotate: -10 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
             <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30"></div>
             <span className="bg-white/90 text-green-600 border-2 border-green-500 px-2 py-1 rounded-lg font-black text-xl shadow-lg transform -rotate-12 backdrop-blur-sm">
               HIT!
             </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const SpikedTrap: React.FC<{ 
  isFalling: boolean; 
  ropeSnapped: boolean;
  onCrush: () => void;
}> = ({ isFalling, ropeSnapped, onCrush }) => {
  return (
    <div className="absolute left-[10%] sm:left-[15%] top-0 flex flex-col items-center z-20 pointer-events-none">
      <div className="relative">
        <AnimatePresence>
          {!ropeSnapped && (
            <motion.div 
              className="w-1 bg-slate-800 origin-top"
              style={{ height: '180px' }}
              exit={{ opacity: 0, height: 0 }}
              initial={{ rotate: 2 }}
              animate={{ rotate: -2 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5, ease: "easeInOut" }}
            >
               <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                  <TrapBody />
               </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {ropeSnapped && (
             <motion.div 
               className="w-1 h-12 bg-slate-800 absolute top-0 left-1/2 -translate-x-1/2 origin-top"
               animate={{ rotate: [0, 15, -10, 0], opacity: [1, 0] }}
               transition={{ duration: 0.5 }}
             />
        )}
      </div>

      {ropeSnapped && (
          <motion.div
            className="absolute top-[180px] left-1/2 -translate-x-1/2"
            initial={{ y: 0, rotate: 0 }}
            animate={{ y: window.innerHeight * 0.6, rotate: 5 }}
            transition={{ duration: 0.3, ease: "easeIn" }}
            onAnimationComplete={onCrush}
          >
              <TrapBody />
          </motion.div>
      )}
    </div>
  );
};

const TrapBody: React.FC = () => (
  <div className="relative filter drop-shadow-xl">
      <svg width="180" height="100" viewBox="0 0 220 120">
        <rect x="10" y="0" width="200" height="80" fill="#334155" stroke="#1e293b" strokeWidth="4" rx="4" />
        <path 
          d="M10,80 L30,110 L50,80 L70,110 L90,80 L110,110 L130,80 L150,110 L170,80 L190,110 L210,80 Z" 
          fill="#334155" 
          stroke="#1e293b" 
          strokeWidth="4" 
          strokeLinejoin="round"
        />
        {/* Rivets */}
        <circle cx="30" cy="20" r="4" fill="#94a3b8" />
        <circle cx="190" cy="20" r="4" fill="#94a3b8" />
        <circle cx="30" cy="60" r="4" fill="#94a3b8" />
        <circle cx="190" cy="60" r="4" fill="#94a3b8" />
        {/* Weight Text */}
        <text x="110" y="50" textAnchor="middle" fill="#94a3b8" fontSize="24" fontFamily="Arial" fontWeight="900" letterSpacing="2">
            1000kg
        </text>
      </svg>
  </div>
);

const Stickman: React.FC<{ 
    isSquashed: boolean; 
    isAiming: boolean;
    bowAngle: number;
}> = ({ isSquashed, isAiming, bowAngle }) => {
  return (
    <motion.div 
      className="absolute left-[10%] sm:left-[15%] bottom-[15%] w-32 h-48 z-10 origin-bottom pointer-events-none"
      animate={isSquashed ? { scaleY: 0.1, scaleX: 1.5 } : {}}
    >
        {isSquashed && (
            <motion.div 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-8 bg-red-500 rounded-[50%] z-0 blur-sm opacity-80"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1 }}
            />
        )}

        {/* Minimalist Black Stickman */}
        <svg width="100%" height="100%" viewBox="0 0 200 300" style={{ overflow: 'visible' }}>
            {/* Legs - Profile Stance */}
            {/* Back Leg */}
            <line x1="100" y1="180" x2="70" y2="280" stroke="black" strokeWidth="8" strokeLinecap="round" />
            {/* Front Leg */}
            <line x1="100" y1="180" x2="130" y2="280" stroke="black" strokeWidth="8" strokeLinecap="round" />
            
            {/* Torso */}
            <line x1="100" y1="180" x2="100" y2="80" stroke="black" strokeWidth="8" strokeLinecap="round" />
            
            {/* Head - Solid Circle */}
            <circle cx="100" cy="50" r="25" fill="black" />

            {/* Rotating Upper Body Group (Arms + Bow) */}
            <motion.g
                initial={{ rotate: 0 }}
                animate={{ rotate: isAiming ? bowAngle : 0 }}
                style={{ transformBox: "fill-box", transformOrigin: "100px 80px" }}
            >
                {/* Back Arm (Drawing string) - Bent */}
                <polyline points="100,80 70,100 50,90" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

                {/* Front Arm (Holding Bow) - Straight */}
                <line x1="100" y1="80" x2="160" y2="90" stroke="black" strokeWidth="6" strokeLinecap="round" />
                
                {/* The Bow - Simple Curve */}
                <path d="M160,30 Q130,90 160,150" fill="none" stroke="black" strokeWidth="6" strokeLinecap="round" />
                
                {/* The String - Drawn back */}
                {/* Top to Nock to Bottom */}
                <polyline points="160,30 50,90 160,150" fill="none" stroke="black" strokeWidth="1" />
                
                {/* The Arrow */}
                <line x1="50" y1="90" x2="180" y2="90" stroke="black" strokeWidth="4" strokeLinecap="round" />
                {/* Arrowhead */}
                <path d="M180,90 L170,85 L170,95 Z" fill="black" />
            </motion.g>
        </svg>
        
        {/* Caption */}
        {!isSquashed && (
           <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-400 whitespace-nowrap bg-white/80 px-2 py-1 rounded-full shadow-sm">
             Aim Carefully 🎯
           </div>
        )}
    </motion.div>
  );
};

// ============================================
// MAIN GAME COMPONENT
// ============================================

const TrapRoom: React.FC<TrapRoomProps> = ({
  question,
  onComplete,
  currentScore = 0,
  questionNumber = 1,
  totalQuestions = 10,
}) => {
  const [phase, setPhase] = useState<'idle' | 'aiming' | 'shooting' | 'hit' | 'death'>('idle');
  const [selectedTarget, setSelectedTarget] = useState<number | null>(null);
  const [bowAngle, setBowAngle] = useState(0);
  const [flightPath, setFlightPath] = useState<Point[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { playSound } = useSound();

  const handleTargetClick = (index: number, e: React.MouseEvent) => {
    if (phase !== 'idle' || !containerRef.current) return;
    playSound('click');
    
    // Capture positions immediately
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();

    // Calculate Hit Position (End) relative to container
    const end = {
      x: (targetRect.left + targetRect.width / 2) - containerRect.left,
      y: (targetRect.top + targetRect.height / 2) - containerRect.top
    };

    // Calculate Start Position (Stickman bow position)
    // Stickman is at left: 15%, bottom: 15%
    const start = {
      x: containerRect.width * 0.15 + 60, 
      y: containerRect.height * 0.85 - 100 
    };

    // Generate Curve
    const path = calculateFlightPath(start, end);
    setFlightPath(path);
    
    setSelectedTarget(index);
    setPhase('aiming');

    // Aim Bow
    const angleRad = Math.atan2(end.y - start.y, end.x - start.x);
    setBowAngle((angleRad * 180 / Math.PI) - 10); 

    // Shoot after delay
    setTimeout(() => {
        playSound('shoot');
        setPhase('shooting');
    }, 300);
  };

  useEffect(() => {
      if (phase === 'shooting') {
          setTimeout(() => {
              const isCorrect = selectedTarget === question.correctAnswer;
              
              if (isCorrect) {
                  playSound('correct');
                  setPhase('hit');
                  setTimeout(() => onComplete(true, 100), 2000);
              } else {
                  setPhase('death');
                  setTimeout(() => {
                      playSound('wrong'); // Spikes crash sound
                      // Continue game even if wrong
                      onComplete(false, 0);
                  }, 2500);
              }
          }, 600); // Flight time matches animation duration
      }
  }, [phase, selectedTarget, question.correctAnswer, onComplete, playSound]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
       
       {/* 🎯 QUESTION / MISSION CARD */}
       <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-40">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            key={question.id}
            className="bg-white rounded-[2rem] shadow-xl px-8 py-6 border border-white/50 backdrop-blur-sm relative"
          >
            <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Mission {questionNumber}
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
              {question.text}
            </h2>

            <div className="mt-4 flex gap-2">
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                🧠 {question.subject || 'Logic'}
              </span>
              <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                ⚡ Challenge
              </span>
            </div>
          </motion.div>
       </div>

       {/* 🎯 ANSWER TARGETS (RIGHT SIDE) */}
       <div className="absolute right-4 sm:right-12 top-1/2 transform -translate-y-1/2 flex flex-col gap-6 z-40 max-h-[60vh] justify-center">
          {question.options.map((opt, idx) => (
             <div key={idx} ref={(el) => { targetRefs.current[idx] = el; }}>
                 <RoundTarget 
                    text={opt} 
                    index={idx}
                    onClick={(e) => handleTargetClick(idx, e)}
                    disabled={phase !== 'idle'}
                    isHit={phase === 'hit' && selectedTarget === idx}
                 />
             </div>
          ))}
       </div>

       {/* GAME ELEMENTS */}
       <SpikedTrap 
          isFalling={phase === 'death'}
          ropeSnapped={phase === 'death'}
          onCrush={() => {}}
       />

       <Stickman 
          isSquashed={phase === 'death'} 
          isAiming={phase === 'aiming' || phase === 'shooting'}
          bowAngle={bowAngle}
       />

       {/* ================= PROJECTILE ================= */}
       {phase === 'shooting' && flightPath.length > 0 && (
           <motion.div
             className="absolute w-12 h-1 z-30 pointer-events-none"
             initial={{ 
               left: flightPath[0].x, 
               top: flightPath[0].y, 
               rotate: flightPath[0].rotation 
             }}
             animate={{
               left: flightPath.map(p => p.x),
               top: flightPath.map(p => p.y),
               rotate: flightPath.map(p => p.rotation)
             }}
             transition={{ duration: 0.6, ease: "linear" }}
           >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-full bg-slate-800 rounded-full" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[12px] border-l-slate-800 border-y-[6px] border-y-transparent" />
           </motion.div>
       )}

       {/* FEEDBACK OVERLAYS */}
       <AnimatePresence>
          {phase === 'hit' && (
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2rem] px-10 py-8 shadow-2xl text-center border border-white"
              >
                <div className="text-6xl mb-4">✨</div>
                <div className="text-3xl font-black text-emerald-600 mb-2">Perfect Shot!</div>
                <div className="text-slate-500 font-bold">+100 XP • Bullseye</div>
              </motion.div>
            </div>
          )}

          {phase === 'death' && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[2rem] px-10 py-8 shadow-2xl text-center border-b-8 border-red-100"
              >
                <div className="text-6xl mb-4">🤕</div>
                <div className="text-2xl font-black text-indigo-900 mb-2">Trap Sprung!</div>
                <div className="text-slate-500">Careful! The spikes are fast.</div>
                <div className="mt-4 text-xs font-bold text-red-400 bg-red-50 px-3 py-1 rounded-full inline-block">
                   Continuing...
                </div>
              </motion.div>
            </div>
          )}
       </AnimatePresence>

    </div>
  );
};

export default TrapRoom;
