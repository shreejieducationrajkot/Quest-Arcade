
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from './components/SoundManager';
import { Shield, Zap } from 'lucide-react';
import { PauseMenu } from './components/PauseMenu';

// === TYPES ===
interface Target {
  id: number;
  optionIndex: number;
  text: string;
  x: number;
  y: number;
  status: 'active' | 'hit_correct' | 'hit_wrong';
  rotation: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  type: 'fire' | 'plasma';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

interface DragonTrainerProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

const MotionG = motion.g as any;
const MotionPath = motion.path as any;
const MotionEllipse = motion.ellipse as any;
const MotionCircle = motion.circle as any;
const MotionDiv = motion.div as any;

// === NEW: 3D FLYING DRAGON COMPONENT ===
const FlyingDragon = ({ state }: { state: 'fly' | 'shoot' | 'hurt' | 'happy' }) => {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full overflow-visible drop-shadow-2xl">
      <defs>
        {/* 3D Body Gradient */}
        <radialGradient id="redBody" cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ef4444" /> {/* Bright Red */}
          <stop offset="100%" stopColor="#7f1d1d" /> {/* Dark Red Shadow */}
        </radialGradient>
        
        {/* 3D Belly Gradient */}
        <linearGradient id="yellowBelly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Wing Gradient */}
        <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>

      <MotionG
        animate={state === 'hurt' ? { x: [-5, 5, -5, 5, 0], rotate: [0, 10, -10, 0] } : { y: [0, -8, 0] }}
        transition={state === 'hurt' ? { duration: 0.4 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* --- BACK WING --- */}
        <MotionPath 
          d="M70,70 Q40,30 90,20 L100,60 Z" 
          fill="url(#wing)" stroke="#78350f" strokeWidth="2"
          initial={{ originX: "70px", originY: "70px" }}
          animate={{ rotate: [-10, 20, -10] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* --- TAIL --- */}
        <path d="M40,90 Q20,100 5,80 L15,95 Q30,110 50,100 Z" fill="url(#redBody)" stroke="#7f1d1d" strokeWidth="2" />
        <path d="M10,80 L20,85 L15,75 Z" fill="#fcd34d" /> {/* Tail Spike */}

        {/* --- BODY (Flying Posture) --- */}
        <ellipse cx="80" cy="90" rx="45" ry="35" fill="url(#redBody)" stroke="#7f1d1d" strokeWidth="2" />
        
        {/* Belly Scales */}
        <path d="M50,105 Q80,125 110,100" fill="none" stroke="#fcd34d" strokeWidth="12" strokeLinecap="round" opacity="0.9" />
        <path d="M50,105 Q80,125 110,100" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="10 10" opacity="0.5" />

        {/* --- LEGS (Tucked Back) --- */}
        <ellipse cx="60" cy="115" rx="15" ry="10" fill="url(#redBody)" stroke="#7f1d1d" strokeWidth="2" transform="rotate(20 60 115)" />
        <path d="M50,120 L45,125 L55,125 Z" fill="#fff" /> {/* Claws */}

        {/* --- HEAD --- */}
        <g transform={state === 'shoot' ? "translate(5, 0) rotate(-5 110 70)" : ""}>
            <circle cx="110" cy="70" r="35" fill="url(#redBody)" stroke="#7f1d1d" strokeWidth="2" />
            
            {/* Snout */}
            <ellipse cx="135" cy="80" rx="20" ry="18" fill="url(#redBody)" stroke="#7f1d1d" strokeWidth="2" />
            <circle cx="145" cy="75" r="2" fill="black" opacity="0.6" /> {/* Nostril */}

            {/* Horns */}
            <path d="M90,45 L80,25 L100,40" fill="#fff" stroke="#d97706" strokeWidth="2" />
            <path d="M110,35 L115,15 L125,35" fill="#fff" stroke="#d97706" strokeWidth="2" />

            {/* EYE (Big Cute) */}
            <g transform="translate(105, 60)">
               <ellipse cx="0" cy="0" rx="12" ry="14" fill="white" stroke="#7f1d1d" strokeWidth="2" />
               <ellipse cx="2" cy="0" rx="7" ry="9" fill="black" />
               <circle cx="5" cy="-4" r="3" fill="white" />
               {/* Blink Animation */}
               <MotionEllipse 
                 cx="0" cy="0" rx="12" ry="14" fill="#ef4444" 
                 animate={{ scaleY: [0, 0, 0, 1, 0] }}
                 transition={{ duration: 4, repeat: Infinity, times: [0, 0.9, 0.95, 0.97, 1] }}
               />
            </g>

            {/* Mouth */}
            <path d={state === 'shoot' ? "M130,90 Q140,105 150,90" : "M130,90 Q140,95 150,90"} stroke="#500724" strokeWidth="2" fill="none" />
            
            {/* Fire Particle (Mouth) */}
            {state === 'shoot' && (
                <MotionCircle cx="150" cy="90" r="10" fill="orange" initial={{scale:0}} animate={{scale:1.5, opacity: 0}} />
            )}
        </g>

        {/* --- FRONT WING --- */}
        <MotionPath 
          d="M80,80 Q50,20 120,10 L130,50 Z" 
          fill="url(#wing)" stroke="#78350f" strokeWidth="2"
          initial={{ originX: "80px", originY: "80px" }}
          animate={{ rotate: [-10, 30, -10] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />

      </MotionG>
    </svg>
  );
};


// === MAIN GAME COMPONENT ===
const DragonTrainer: React.FC<DragonTrainerProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [dragonY, setDragonY] = useState(50);
  const [targets, setTargets] = useState<Target[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const [dragonState, setDragonState] = useState<'fly' | 'shoot' | 'hurt' | 'happy'>('fly');
  const [bgOffset, setBgOffset] = useState(0);

  const { playSound } = useSound();

  // 1. Init
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      const qs = getQuestionsForGrade(student?.grade || '5');
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
  }, [student, customQuestions]);

  // 2. Spawn Targets
  useEffect(() => {
    if (questions.length === 0) return;
    const currentQ = questions[currentIndex];
    
    setTargets(currentQ.options.map((opt, i) => ({
      id: i,
      optionIndex: i,
      text: opt,
      x: 100 + (i * 15) + (Math.random() * 10), 
      y: 15 + (i * 20) + (Math.random() * 10), 
      status: 'active',
      rotation: (Math.random() - 0.5) * 10
    })));
    setProjectiles([]);
  }, [currentIndex, questions]);

  // 3. Main Game Loop
  useEffect(() => {
    if (isPaused) return;

    let frameId: number;

    const loop = () => {
      setBgOffset(prev => (prev + 2) % 2000);

      // Loop Targets
      setTargets(prev => {
        const activeTargets = prev.filter(t => t.status === 'active');
        const allOffScreen = activeTargets.length > 0 && activeTargets.every(t => t.x < -20);

        if (allOffScreen) {
            return prev.map((t, i) => ({
                ...t,
                x: 110 + (i * 15),
                y: 15 + (Math.random() * 60)
            }));
        }

        return prev.map(t => {
          if (t.status !== 'active') return t;
          return { 
              ...t, 
              x: t.x - 0.4, 
              y: t.y + Math.sin(Date.now() / 400 + t.id) * 0.1 
          };
        });
      });

      // Projectiles
      setProjectiles(prev => prev.map(p => ({ ...p, x: p.x + 2 })).filter(p => p.x < 110));

      // Particles
      setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.03
      })).filter(p => p.life > 0));

      // Collisions
      setProjectiles(prevProj => {
        let activeProj = [...prevProj];
        
        setTargets(prevTargets => prevTargets.map(target => {
          if (target.status !== 'active') return target;

          const hitIndex = activeProj.findIndex(p => 
            Math.abs(p.x - target.x) < 5 && Math.abs(p.y - target.y) < 8
          );

          if (hitIndex !== -1) {
            activeProj.splice(hitIndex, 1);
            const isCorrect = target.optionIndex === questions[currentIndex].correctAnswer;
            handleCollision(target, isCorrect);
            return { ...target, status: isCorrect ? 'hit_correct' : 'hit_wrong' };
          }
          return target;
        }));
        return activeProj;
      });

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [questions, currentIndex, isPaused]);

  // 4. Mouse Tracking
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || isPaused) return;
    const rect = containerRef.current.getBoundingClientRect();
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setDragonY(prev => prev + (y - prev) * 0.2);
  };

  // 5. Interaction
  const handleShoot = () => {
    if (isPaused) return;
    setDragonState('shoot');
    playSound('click');
    setTimeout(() => setDragonState('fly'), 300);

    const type = streak > 2 ? 'plasma' : 'fire';
    setProjectiles(prev => [...prev, { id: Date.now(), x: 25, y: dragonY + 2, type }]);
  };

  const handleCollision = (target: Target, isCorrect: boolean) => {
    const color = isCorrect ? '#fbbf24' : '#52525b';
    const newParticles = Array.from({ length: 15 }).map(() => ({
        id: Math.random(),
        x: target.x,
        y: target.y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        color,
        life: 1
    }));
    setParticles(prev => [...prev, ...newParticles]);

    if (isCorrect) {
        playSound('correct');
        setScore(s => s + 100 + (streak * 25));
        setStreak(s => s + 1);
        setDragonState('happy');
    } else {
        playSound('wrong');
        setDragonState('hurt');
        setStreak(0);
    }

    // INSTANT NEXT LEVEL
    setTimeout(() => {
        setDragonState('fly');
        if (currentIndex + 1 >= questions.length) {
            onGameOver({ score: score + (isCorrect ? 100 : 0), streak, questionsAnswered: currentIndex + 1, correctAnswers: 0, timeElapsed: 0, level: 1 });
        } else {
            setCurrentIndex(p => p + 1);
        }
    }, 600);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setDragonState('fly');
    setTargets([]);
    setProjectiles([]);
    setParticles([]);
    setIsPaused(false);
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleShoot}
      className="relative w-full h-full overflow-hidden bg-[#60a5fa] cursor-crosshair select-none font-sans"
    >
      <PauseMenu 
        onPause={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onRestart={handleRestart}
        onQuit={onExit || (() => {})}
      />
      
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500 to-sky-200"></div>
      <div className="absolute inset-0 opacity-80" style={{ backgroundImage: 'url(https://www.transparenttextures.com/patterns/clouds.png)', backgroundPosition: `-${bgOffset * 0.5}px 0` }} />
      <div className="absolute bottom-0 w-[200%] h-48 flex items-end opacity-90" style={{ transform: `translateX(-${bgOffset}px)` }}>
         {[...Array(12)].map((_, i) => (
             <div key={i} className="w-96 h-32 bg-emerald-700 rounded-t-[100%] transform -translate-x-20 border-t-8 border-emerald-500"></div>
         ))}
      </div>

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-start pointer-events-none">
         <div className="flex-1 flex justify-center">
             <div className="relative bg-[#7f1d1d] border-4 border-[#fbbf24] px-8 py-3 rounded-full shadow-2xl max-w-2xl text-center">
                 <h2 className="text-xl md:text-2xl font-black text-white relative z-10 drop-shadow-md">
                    {currentQ.text}
                 </h2>
             </div>
         </div>
         <div className="absolute right-6 top-6 flex flex-col items-end gap-2">
             <div className="flex items-center gap-2 bg-black/60 px-4 py-1 rounded-full border border-white/20 text-white font-mono">
                 <Shield size={16} className="text-blue-400" />
                 <span>{score}</span>
             </div>
         </div>
      </div>

      {/* 3D DRAGON */}
      <MotionDiv 
        className="absolute left-[2%] w-48 h-48 z-40"
        style={{ top: `${dragonY}%`, marginTop: '-96px' }}
      >
         <FlyingDragon state={dragonState} />
      </MotionDiv>

      {/* PROJECTILES */}
      {projectiles.map(p => (
          <div key={p.id} className="absolute w-12 h-8 z-30" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
             <div className={`w-full h-full rounded-full blur-sm ${p.type === 'plasma' ? 'bg-cyan-400 box-shadow-[0_0_15px_cyan]' : 'bg-orange-500 box-shadow-[0_0_10px_orange]'}`}></div>
             <div className="absolute inset-2 bg-white rounded-full scale-y-50"></div>
          </div>
      ))}

      {/* TARGETS */}
      {targets.map(t => {
         if (t.status !== 'active') return null;
         return (
            <MotionDiv
               key={t.id}
               className="absolute z-20 w-40 h-28 flex items-center justify-center"
               style={{ left: `${t.x}%`, top: `${t.y}%` }}
               animate={{ rotate: [t.rotation, t.rotation + 5, t.rotation] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
               <div className="relative w-full h-full transform scale-90">
                   <div className="absolute inset-0 bg-[#57534e] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] shadow-xl border-b-8 border-[#292524]"></div>
                   <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#4ade80] rounded-t-xl border-b-4 border-[#16a34a]"></div>
                   <div className="absolute inset-0 flex items-center justify-center pb-2">
                       <span className="font-black text-[#1e293b] text-xl drop-shadow-sm bg-white/90 px-3 py-1 rounded-lg">
                           {t.text}
                       </span>
                   </div>
               </div>
            </MotionDiv>
         );
      })}

      {/* PARTICLES */}
      {particles.map(p => (
          <div key={p.id} className="absolute w-3 h-3 rounded-md z-30" style={{ left: `${p.x}%`, top: `${p.y}%`, backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
      ))}

    </div>
  );
};

export default DragonTrainer;
