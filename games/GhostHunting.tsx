
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from './components/SoundManager';
import { Zap, Activity, Battery, Ghost } from 'lucide-react';
import { PauseMenu } from './components/PauseMenu';

// === TYPES ===
interface GhostEntity {
  id: number;
  optionIndex: number;
  text: string;
  x: number; // %
  y: number; // %
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  type: 'classic' | 'blob' | 'wisp';
}

const GHOST_COLORS = ['#a5b4fc', '#c4b5fd', '#86efac', '#fdba74']; // Pastel spectral colors

const MotionDiv = motion.div as any;
const MotionPath = motion.path as any;
const MotionCircle = motion.circle as any;

interface GhostHuntProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const GhostHunt: React.FC<GhostHuntProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Physics & Interaction
  const [ghosts, setGhosts] = useState<GhostEntity[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isFiring, setIsFiring] = useState(false);
  const [beamTarget, setBeamTarget] = useState<{x: number, y: number} | null>(null);
  
  // EMF Meter Logic
  const [emfLevel, setEmfLevel] = useState(1); // 1-5 bars

  // Game Flow
  const [result, setResult] = useState<'caught' | 'miss' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { playSound } = useSound();

  // 1. Init
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [student.grade, customQuestions]);

  // 2. Spawn Ghosts
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    
    const newGhosts = currentQ.options.map((opt, i) => ({
      id: i,
      optionIndex: i,
      text: opt,
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      vx: (Math.random() - 0.5) * 0.05,
      vy: (Math.random() - 0.5) * 0.05,
      scale: Math.random() * 0.2 + 0.9,
      opacity: 0.1, // Start invisible
      type: (['classic', 'blob', 'wisp'] as const)[i % 3]
    }));
    setGhosts(newGhosts);
    setResult(null);
    setIsTransitioning(false);
  }, [currentIndex, questions]);

  // 3. Physics & EMF Loop
  useEffect(() => {
    if (isTransitioning || isPaused) return;
    let frameId: number;

    const loop = () => {
      // Move Ghosts
      setGhosts(prev => prev.map(g => {
        let newX = g.x + g.vx;
        let newY = g.y + g.vy;
        if (newX < 5 || newX > 95) g.vx *= -1;
        if (newY < 15 || newY > 85) g.vy *= -1;
        return { ...g, x: newX, y: newY };
      }));

      frameId = requestAnimationFrame(loop);
    };
    
    loop();
    return () => cancelAnimationFrame(frameId);
  }, [isTransitioning, isPaused]);

  // 4. Unified Input Handling (Touch & Mouse)
  const handleInputMove = (e: React.MouseEvent | React.TouchEvent) => {
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

    // EMF Calculation (Proximity to Correct Answer)
    if (questions.length > 0) {
        const correctGhost = ghosts.find(g => g.optionIndex === questions[currentIndex].correctAnswer);
        if (correctGhost) {
            const gx = (correctGhost.x / 100) * rect.width;
            const gy = (correctGhost.y / 100) * rect.height;
            const dist = Math.hypot(gx - x, gy - y);
            const maxDist = Math.min(250, rect.width * 0.5);
            const level = Math.max(1, Math.min(5, Math.floor(6 - (dist / (maxDist / 3)))));
            setEmfLevel(level);
        }
    }
  };

  // 5. Fire Proton Beam
  const handleInputStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isTransitioning || isFiring || isPaused) return;

    handleInputMove(e);

    setIsFiring(true);
    setBeamTarget({ x: mousePos.x, y: mousePos.y });
    playSound('click'); 

    const container = containerRef.current;
    if (!container) return;
    
    const clickXPct = (mousePos.x / container.clientWidth) * 100;
    const clickYPct = (mousePos.y / container.clientHeight) * 100;

    const hitGhost = ghosts.find(g => 
      Math.abs(g.x - clickXPct) < 15 &&  // Forgiving hit box for mobile
      Math.abs(g.y - clickYPct) < 15
    );

    setTimeout(() => {
        setIsFiring(false);
        setBeamTarget(null);

        if (hitGhost) {
            const currentQ = questions[currentIndex];
            const isCorrect = hitGhost.optionIndex === currentQ.correctAnswer;
            setIsTransitioning(true);

            if (isCorrect) {
                playSound('correct');
                setScore(s => s + 200);
                setResult('caught');
            } else {
                playSound('wrong');
                setResult('miss');
            }

            setTimeout(() => {
                if (currentIndex + 1 >= questions.length) {
                    onGameOver({ score: score + (isCorrect?200:0), streak: 0, questionsAnswered: currentIndex+1, correctAnswers: 0, timeElapsed: 0, level: 1 });
                } else {
                    setCurrentIndex(p => p + 1);
                }
            }, 2000);
        }
    }, 400); 
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIndex(0);
    setGhosts([]);
    setEmfLevel(1);
    setResult(null);
    setIsPaused(false);
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleInputMove}
      onTouchMove={handleInputMove}
      onMouseDown={handleInputStart}
      onTouchStart={handleInputStart}
      className="relative w-full h-full overflow-hidden bg-black cursor-none select-none font-mono touch-none"
      style={{ touchAction: 'none' }}
    >
      <PauseMenu 
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onQuit={onExit || (() => {})}
      />
      
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 bg-[#1a1a1a]"
        style={{
            backgroundImage: `radial-gradient(#333 1px, transparent 1px), radial-gradient(#222 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
        }}
      ></div>

      {/* Eyes */}
      <div className="absolute top-[20%] left-[10%] opacity-20 animate-pulse">
          <div className="flex gap-2"><div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div><div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div></div>
      </div>
      <div className="absolute bottom-[30%] right-[15%] opacity-20 animate-pulse delay-700">
          <div className="flex gap-2"><div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div><div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_5px_red]"></div></div>
      </div>

      {/* Flashlight Overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle 220px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(0,0,0,0.98) 100%)`
        }}
      ></div>

      {/* Ghosts */}
      {ghosts.map((g) => {
        const gx = (g.x / 100) * (containerRef.current?.clientWidth || 1000);
        const gy = (g.y / 100) * (containerRef.current?.clientHeight || 800);
        const dist = Math.hypot(gx - mousePos.x, gy - mousePos.y);
        const visibility = Math.max(0, 1 - (dist / 220)); 

        return (
          <MotionDiv 
            key={g.id}
            className="absolute z-20 flex flex-col items-center justify-center pointer-events-none"
            style={{ 
              left: `${g.x}%`, 
              top: `${g.y}%`,
              transform: 'translate(-50%, -50%)',
              opacity: visibility + 0.1 
            }}
            animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
             <div className="relative drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] transform scale-75 md:scale-100">
                <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                    <path d="M10,100 Q10,10 50,10 Q90,10 90,100" fill={GHOST_COLORS[g.id % GHOST_COLORS.length]} fillOpacity="0.1" filter="blur(10px)" />
                    <path 
                        d="M20,100 Q20,20 50,20 Q80,20 80,100 L70,90 L60,100 L50,90 L40,100 L30,90 L20,100 Z" 
                        fill={GHOST_COLORS[g.id % GHOST_COLORS.length]} 
                        fillOpacity="0.8"
                    />
                    <circle cx="40" cy="45" r="4" fill="#000" />
                    <circle cx="60" cy="45" r="4" fill="#000" />
                    <circle cx="50" cy="60" r="3" fill="#000" />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-8">
                    <span className="bg-black/50 text-white px-2 py-1 rounded text-xs md:text-sm font-bold backdrop-blur-sm border border-white/20 whitespace-nowrap">
                        {g.text}
                    </span>
                </div>
             </div>
          </MotionDiv>
        );
      })}

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex flex-col items-center pointer-events-none safe-area-top">
         <div className="bg-slate-900/90 border border-slate-600 px-4 py-3 md:px-6 md:py-4 rounded-lg shadow-[0_0_20px_rgba(0,0,0,0.8)] max-w-2xl text-center mb-4 w-[90%]">
            <h2 className="text-lg md:text-2xl font-bold text-slate-200 tracking-wide font-sans leading-tight">{currentQ.text}</h2>
         </div>
         <div className="flex gap-4 items-center bg-black/80 px-4 py-2 rounded-full border border-slate-700">
            <div className="flex items-center gap-2 border-r border-slate-600 pr-4">
                <span className="text-xs text-slate-400 font-bold">EMF</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(level => (
                        <div 
                            key={level} 
                            className={`w-2 h-4 md:w-3 md:h-6 rounded-sm transition-all duration-200 ${
                                emfLevel >= level 
                                ? (level > 3 ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-green-500 shadow-[0_0_5px_green]') 
                                : 'bg-slate-800'
                            }`}
                        />
                    ))}
                </div>
            </div>
         </div>
      </div>

      {/* Beam Animation */}
      <AnimatePresence>
        {isFiring && beamTarget && (
            <svg className="absolute inset-0 z-30 pointer-events-none overflow-visible">
                <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <MotionPath
                    initial={{ pathLength: 0, opacity: 1 }}
                    animate={{ pathLength: 1, opacity: [1, 0.5, 1] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    d={`M${containerRef.current?.clientWidth! / 2},${containerRef.current?.clientHeight} L${beamTarget.x},${beamTarget.y}`}
                    stroke="#fbbf24" strokeWidth="6" fill="none" filter="url(#glow)" strokeLinecap="round"
                />
                <MotionPath
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    d={`M${containerRef.current?.clientWidth! / 2},${containerRef.current?.clientHeight} Q${beamTarget.x + 50},${beamTarget.y + 100} ${beamTarget.x},${beamTarget.y}`}
                    stroke="#ef4444" strokeWidth="2" fill="none" className="animate-pulse"
                />
                <MotionCircle 
                    cx={beamTarget.x} cy={beamTarget.y} r="20" 
                    fill="#fbbf24" filter="url(#glow)"
                    initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }}
                />
            </svg>
        )}
      </AnimatePresence>

      {/* Result Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 pointer-events-none"
          >
             {result === 'caught' ? (
                <>
                    <Ghost size={80} className="text-green-400 mb-4 animate-bounce" />
                    <h1 className="text-3xl md:text-5xl font-black text-green-400 tracking-tighter drop-shadow-[0_0_15px_green] text-center px-4">ENTITY CAPTURED</h1>
                </>
             ) : (
                <>
                    <Zap size={80} className="text-red-500 mb-4 animate-pulse" />
                    <h1 className="text-3xl md:text-5xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_15px_red] text-center px-4">CONTAINMENT BREACH</h1>
                </>
             )}
          </MotionDiv>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GhostHunt;
