
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from './components/SoundManager';
import { Heart, Crosshair, Radar, Activity } from 'lucide-react';
import { PauseMenu } from './components/PauseMenu';

// === TYPES & CONSTANTS ===
interface Creature {
  id: number;
  optionIndex: number;
  text: string;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  vx: number;
  vy: number;
  type: 'jelly' | 'angler' | 'puffer';
  scale: number;
  color: string;
}

interface HarpoonShot {
  x: number; // Target X px
  y: number; // Target Y px
  hit: boolean;
}

interface TreasureDiverProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const CREATURE_TYPES = ['jelly', 'angler', 'puffer'] as const;
const NEON_COLORS = ['#ff00ff', '#00ffff', '#ffff00', '#00ff00'];

const MotionDiv = motion.div as any;
const MotionPath = motion.path as any;
const MotionLine = motion.line as any;
const MotionCircle = motion.circle as any;

const TreasureDiver: React.FC<TreasureDiverProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Physics & Interaction
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [harpoon, setHarpoon] = useState<HarpoonShot | null>(null);
  const [isLockedOn, setIsLockedOn] = useState(false); // Hovering over a target?
  
  // Sonar State
  const [sonarPing, setSonarPing] = useState(false);

  // Game Flow
  const [result, setResult] = useState<'caught' | 'miss' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { playSound } = useSound();

  // 1. Init
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
    
    // Sonar Loop
    const sonarInterval = setInterval(() => {
        if (!isPaused) {
            setSonarPing(true);
            setTimeout(() => setSonarPing(false), 2000);
        }
    }, 4000);
    return () => clearInterval(sonarInterval);
  }, [student, customQuestions, isPaused]);

  // 2. Spawn Creatures
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    
    const newCreatures = currentQ.options.map((opt, i) => ({
      id: i,
      optionIndex: i,
      text: opt,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.05,
      type: CREATURE_TYPES[i % CREATURE_TYPES.length],
      scale: Math.random() * 0.2 + 0.9,
      color: NEON_COLORS[i % NEON_COLORS.length]
    }));
    setCreatures(newCreatures);
    setResult(null);
    setIsTransitioning(false);
  }, [currentIndex, questions]);

  // 3. Physics Loop
  useEffect(() => {
    if (isTransitioning || isPaused) return;
    let animationFrameId: number;

    const loop = () => {
      setCreatures(prev => prev.map(c => {
        let newX = c.x + c.vx;
        let newY = c.y + c.vy;

        // Bounce off walls
        if (newX < 5 || newX > 95) c.vx *= -1;
        if (newY < 15 || newY > 85) c.vy *= -1;

        return { ...c, x: newX, y: newY };
      }));
      animationFrameId = requestAnimationFrame(loop);
    };
    
    loop();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTransitioning, isPaused]);

  // 4. Mouse & Collision Logic
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || isPaused) return;
    const rect = containerRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setMousePos({ x, y });

    // Check Lock-on (Visual only)
    const xPct = (x / rect.width) * 100;
    const yPct = (y / rect.height) * 100;
    const hovering = creatures.some(c => Math.abs(c.x - xPct) < 8 && Math.abs(c.y - yPct) < 12);
    setIsLockedOn(hovering);
  };

  const handleFire = () => {
    if (isTransitioning || harpoon || isPaused) return;

    // 1. Calculate Hit
    const container = containerRef.current;
    if (!container) return;
    
    const clickXPct = (mousePos.x / container.clientWidth) * 100;
    const clickYPct = (mousePos.y / container.clientHeight) * 100;

    const hitCreature = creatures.find(c => 
      Math.abs(c.x - clickXPct) < 8 && 
      Math.abs(c.y - clickYPct) < 12
    );

    // 2. Trigger Harpoon Animation
    setHarpoon({ x: mousePos.x, y: mousePos.y, hit: !!hitCreature });
    playSound(hitCreature ? 'click' : 'click'); // Replace with shoot sound

    // 3. Resolve Hit
    if (hitCreature) {
      setTimeout(() => {
          const currentQ = questions[currentIndex];
          const isCorrect = hitCreature.optionIndex === currentQ.correctAnswer;
          setIsTransitioning(true);
          
          if (isCorrect) {
            playSound('correct');
            setScore(s => s + 200);
            setResult('caught');
          } else {
            playSound('wrong');
            setResult('miss');
          }

          // Next Level
          setTimeout(() => {
            setHarpoon(null);
            if (currentIndex + 1 >= questions.length) {
               onGameOver({ score: score + (isCorrect?200:0), streak: 0, questionsAnswered: currentIndex+1, correctAnswers: 0, timeElapsed: 0, level: 1 });
            } else {
              setCurrentIndex(p => p + 1);
            }
          }, 2000);
      }, 300); // Wait for harpoon to reach target
    } else {
        setTimeout(() => setHarpoon(null), 300); // Miss reset
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIndex(0);
    setCreatures([]);
    setHarpoon(null);
    setResult(null);
    setIsPaused(false);
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleFire}
      onClick={handleFire}
      className="relative w-full h-full overflow-hidden bg-black cursor-none select-none font-mono"
      style={{ touchAction: 'none' }}
    >
      <PauseMenu 
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onQuit={onExit || (() => {})}
      />
      
      {/* === LAYER 1: DEEP OCEAN BACKGROUND === */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#001020] via-[#000510] to-black"></div>
      
      {/* Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none z-30 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>

      {/* Spotlight Mask */}
      <div 
        className="absolute inset-0 pointer-events-none z-20 transition-all duration-75 ease-out"
        style={{
          background: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,5,10,0.95) 100%)`
        }}
      ></div>


      {/* === LAYER 2: CREATURES === */}
      {creatures.map((c) => (
        <div 
          key={c.id}
          className="absolute z-10 pointer-events-none"
          style={{ 
            left: `${c.x}%`, 
            top: `${c.y}%`,
            transform: `translate(-50%, -50%) scale(${c.scale})`
          }}
        >
           {/* Creature Container */}
           <MotionDiv 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
             className="relative flex flex-col items-center"
           >
              {/* --- SVG CREATURES --- */}
              
              {/* 1. JELLYFISH */}
              {c.type === 'jelly' && (
                <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                   <path d="M20,40 Q50,-10 80,40" fill={c.color} fillOpacity="0.4" stroke={c.color} strokeWidth="2" />
                   <path d="M20,40 Q50,55 80,40" fill={c.color} fillOpacity="0.6" />
                   {/* Tentacles */}
                   {[25, 40, 55, 70].map((tx, i) => (
                     <MotionPath 
                        key={i}
                        d={`M${tx},45 Q${tx-5},70 ${tx},90`}
                        stroke={c.color} strokeWidth="2" fill="none"
                        animate={{ d: [`M${tx},45 Q${tx-5},70 ${tx},90`, `M${tx},45 Q${tx+5},70 ${tx},90`, `M${tx},45 Q${tx-5},70 ${tx},90`] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                     />
                   ))}
                </svg>
              )}

              {/* 2. ANGLER FISH */}
              {c.type === 'angler' && (
                <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                   {/* Lure */}
                   <path d="M80,30 Q90,10 100,20" stroke="white" fill="none" />
                   <circle cx="100" cy="20" r="4" fill={c.color} className="animate-pulse" />
                   {/* Body */}
                   <path d="M20,50 Q40,10 80,30 Q100,50 80,70 Q40,90 20,50" fill={c.color} fillOpacity="0.2" stroke={c.color} strokeWidth="2"/>
                   {/* Tail */}
                   <path d="M20,50 L5,35 L5,65 Z" fill={c.color} fillOpacity="0.4" />
                   {/* Fin */}
                   <path d="M50,30 Q60,10 70,30" fill={c.color} fillOpacity="0.4" />
                </svg>
              )}

              {/* 3. PUFFER FISH */}
              {c.type === 'puffer' && (
                <svg width="100" height="100" viewBox="0 0 100 100" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                   <circle cx="50" cy="50" r="30" fill={c.color} fillOpacity="0.3" stroke={c.color} strokeWidth="2" />
                   {/* Spikes */}
                   {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                      <rect key={i} x="48" y="15" width="4" height="10" fill={c.color} transform={`rotate(${deg} 50 50)`} />
                   ))}
                   <circle cx="40" cy="45" r="3" fill="white" />
                   <circle cx="60" cy="45" r="3" fill="white" />
                </svg>
              )}

              {/* Answer Text Label */}
              <div 
                className="mt-2 px-3 py-1 bg-black/60 border border-cyan-500/50 rounded text-cyan-100 font-bold text-base md:text-lg whitespace-nowrap backdrop-blur-sm shadow-[0_0_10px_black]"
                style={{ textShadow: `0 0 5px ${c.color}` }}
              >
                {c.text}
              </div>
           </MotionDiv>
        </div>
      ))}


      {/* === LAYER 3: HUD === */}
      <div className="absolute inset-0 z-40 pointer-events-none p-4 flex flex-col justify-between safe-area-top">
         
         {/* Top HUD */}
         <div className="flex justify-between items-start">
            {/* Radar */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-black/40 rounded-full border border-green-900 overflow-hidden flex items-center justify-center">
               <div className={`absolute inset-0 border-r border-green-500/50 ${sonarPing ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}></div>
               {creatures.map(c => (
                 <div key={'dot'+c.id} className="absolute w-1 h-1 bg-red-500 rounded-full" style={{ left: `${c.x}%`, top: `${c.y}%` }} />
               ))}
               <Radar size={16} className="text-green-600/50" />
            </div>

            {/* Question Panel */}
            <div className="bg-black/70 border-x-4 border-cyan-500/50 px-6 py-3 max-w-xl text-center backdrop-blur-md mx-2">
                <div className="text-cyan-600 text-[10px] tracking-[0.3em] mb-1">TARGET ID</div>
                <h2 className="text-lg md:text-2xl text-white font-bold drop-shadow-[0_0_5px_cyan] leading-tight">{currentQ.text}</h2>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 items-end">
               <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
                  <span className="hidden md:inline">SCORE</span> <span className="bg-cyan-900/30 px-2 rounded border border-cyan-500">{score}</span>
               </div>
            </div>
         </div>

         {/* Bottom Status */}
         <div className="flex justify-center">
             <div className="flex items-center gap-2 md:gap-4 text-green-500/60 text-[10px] md:text-xs uppercase tracking-widest bg-black/40 px-4 py-1 rounded-full border border-green-900">
                <Activity size={14} className="animate-pulse" /> <span className="hidden md:inline">Systems Nominal</span>
                <span>|</span>
                <span>D: {(currentIndex+1)*150}m</span>
                <span>|</span>
                <span>∞</span>
             </div>
         </div>
      </div>


      {/* === LAYER 4: HARPOON & CURSOR === */}
      
      {/* Harpoon Line Animation */}
      {harpoon && (
        <svg className="absolute inset-0 z-20 pointer-events-none">
           <MotionLine 
             x1="50%" y1="100%" 
             x2={harpoon.x} y2={harpoon.y}
             stroke="cyan" strokeWidth="2"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 0.1 }}
           />
           <MotionCircle cx={harpoon.x} cy={harpoon.y} r="5" fill="white" />
        </svg>
      )}

      {/* Custom Crosshair Cursor */}
      <div 
        className="absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
        style={{ left: mousePos.x, top: mousePos.y }}
      >
         <div className={`relative flex items-center justify-center ${isLockedOn ? 'scale-125' : 'scale-100'} transition-transform`}>
            {/* Outer Ring */}
            <div className={`w-16 h-16 border-2 rounded-full ${isLockedOn ? 'border-red-500 animate-spin-slow' : 'border-cyan-400/50'}`}></div>
            {/* Inner Cross */}
            <Crosshair className={`absolute w-8 h-8 ${isLockedOn ? 'text-red-500' : 'text-cyan-400'}`} />
            {/* Lock Text */}
            {isLockedOn && <div className="absolute -bottom-8 bg-red-600/80 text-white text-[10px] px-1 rounded">LOCK</div>}
         </div>
      </div>

      {/* === LAYER 5: RESULT FEEDBACK === */}
      <AnimatePresence>
        {isTransitioning && (
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 pointer-events-none"
          >
             <div className={`border-4 p-8 rounded-2xl bg-black ${result === 'caught' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500'}`}>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-[0_0_20px_currentColor] text-center">
                   {result === 'caught' ? 'CAPTURED' : 'MISSED'}
                </h1>
                <div className="h-1 bg-current w-full mt-4 animate-pulse"></div>
             </div>
          </MotionDiv>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TreasureDiver;
