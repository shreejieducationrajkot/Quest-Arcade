
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from '../games/components/SoundManager';
import { Star, Zap } from 'lucide-react';
import { PauseMenu } from '../games/components/PauseMenu';

// === TYPES ===
interface FruitData {
  id: number;
  optionIndex: number;
  option: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  isSliced: boolean;
  style: FruitStyle;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  size: number;
  life: number;
  isGlow?: boolean;
}

interface SlicedHalf {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  style: FruitStyle;
  isLeft: boolean;
  life: number;
}

interface FruitStyle {
  name: string;
  outer: string;
  inner: string;
  juice: string;
}

interface NinjaSliceProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
  onExit?: () => void;
}

// === CONSTANTS ===
const GRAVITY = 0.15;
const FRUIT_SIZE = 110;
const SPAWN_INTERVAL = 5000; 

const FRUIT_STYLES: FruitStyle[] = [
  { name: 'Watermelon', outer: '#16a34a', inner: '#ef4444', juice: '#ef4444' },
  { name: 'Orange', outer: '#ea580c', inner: '#fed7aa', juice: '#fb923c' },
  { name: 'Apple', outer: '#dc2626', inner: '#fef3c7', juice: '#fca5a5' },
  { name: 'Kiwi', outer: '#854d0e', inner: '#84cc16', juice: '#a3e635' },
  { name: 'Grape', outer: '#7c3aed', inner: '#c4b5fd', juice: '#a78bfa' },
  { name: 'Lemon', outer: '#eab308', inner: '#fef9c3', juice: '#fde047' },
];

const FLAVOR_TEXT = {
  hit: ["SLICE! 🔪", "PERFECT! ✨", "SWOOSH! 💨", "NICE CUT! ⚔️"],
  miss: ["BOOM! 💣", "WRONG! ❌", "OOPS! 😅"],
};

const MotionDiv = motion.div as any;

// === MATH HELPERS ===
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const lineIntersectsCircle = (x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number): boolean => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  let discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return false;
  discriminant = Math.sqrt(discriminant);
  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);
  if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) return true;
  return false;
};

// === COMPONENT ===
const NinjaSlice: React.FC<NinjaSliceProps> = ({ student, customQuestions, onGameOver, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastSpawnRef = useRef<number>(0);
  const isSlicingRef = useRef(false);
  const slicePointsRef = useRef<{ x: number; y: number; time: number }[]>([]);

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fruits, setFruits] = useState<FruitData[]>([]);
  const [slicedHalves, setSlicedHalves] = useState<SlicedHalf[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const [resultText, setResultText] = useState('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [spawnedOptions, setSpawnedOptions] = useState<Set<number>>(new Set());

  const { playSound } = useSound();

  // 1. Initialize Questions
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5).slice(0, 10));
    }
    setScore(0);
    setCurrentIndex(0);
  }, [student, customQuestions]);

  // 2. Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 3. Spawning Helper
  const spawnFruit = useCallback((forceOptionIndex?: number) => {
    if (!containerSize.width || result || isPaused || questions.length === 0) return;

    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    
    // Choose index
    let optionIndex = forceOptionIndex;
    if (optionIndex === undefined) {
      const availableOptions = currentQ.options.map((_, i) => i).filter(i => !spawnedOptions.has(i));
      if (availableOptions.length === 0) {
        if (fruits.filter(f => !f.isSliced).length === 0) {
             setSpawnedOptions(new Set()); // Reset to allow respawn
        }
        return; 
      }
      optionIndex = availableOptions[Math.floor(Math.random() * availableOptions.length)];
    }

    const style = FRUIT_STYLES[optionIndex % FRUIT_STYLES.length];
    
    // Physics Init
    const spawnX = randomBetween(containerSize.width * 0.15, containerSize.width * 0.85);
    const spawnY = containerSize.height + FRUIT_SIZE;
    const targetX = randomBetween(containerSize.width * 0.3, containerSize.width * 0.7);
    const velocityX = (targetX - spawnX) / 110; 
    const velocityY = -randomBetween(13, 17);

    const newFruit: FruitData = {
      id: Math.random(),
      optionIndex,
      option: currentQ.options[optionIndex],
      x: spawnX,
      y: spawnY,
      velocityX,
      velocityY,
      rotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(-4, 4),
      scale: 1,
      isSliced: false,
      style
    };

    setFruits(prev => [...prev, newFruit]);
    setSpawnedOptions(prev => new Set([...prev, optionIndex!]));
    
    // Only play sound for manual spawns to avoid noise chaos on burst
    if (forceOptionIndex === undefined) playSound('click'); 

  }, [containerSize, result, isPaused, questions, currentIndex, spawnedOptions, fruits, playSound]);

  // === BURST SPAWN EFFECT ===
  useEffect(() => {
    if (!containerSize.width || questions.length === 0) return;

    // HARD RESET of all physics objects
    setFruits([]);
    setSlicedHalves([]);
    setParticles([]);
    setSpawnedOptions(new Set());
    
    // HARD RESET of Timers
    lastSpawnRef.current = Date.now() + 2000; // Delay the loop spawner so burst happens first

    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const totalOptions = currentQ.options.length;

    // Trigger Burst
    for (let i = 0; i < totalOptions; i++) {
        setTimeout(() => {
            // Check if game is still active for this question
            setResult(currentResult => {
               if (!currentResult) {
                 spawnFruit(i); 
               }
               return currentResult;
            });
        }, i * 200); // 200ms delay between burst
    }

  }, [currentIndex, questions, containerSize.width]); // Trigger on Question Change


  // 4. Interaction (Slice) Logic
  const handleSlice = useCallback((fruit: FruitData, sliceAngle: number) => {
    if (fruit.isSliced || result) return;

    const currentQ = questions[currentIndex];
    const isCorrect = fruit.optionIndex === currentQ.correctAnswer;

    // Particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: Math.random(),
        x: fruit.x,
        y: fruit.y,
        velocityX: randomBetween(-8, 8),
        velocityY: randomBetween(-8, 8),
        color: isCorrect ? fruit.style.juice : '#333',
        size: randomBetween(4, 10),
        life: 1,
        isGlow: isCorrect
      });
    }
    setParticles(prev => [...prev, ...newParticles]);

    // Halves
    const halfVelocity = 5;
    const newHalves: SlicedHalf[] = [
      {
        id: Math.random(),
        x: fruit.x,
        y: fruit.y,
        velocityX: -Math.cos(sliceAngle * Math.PI / 180) * halfVelocity,
        velocityY: -5,
        rotation: sliceAngle,
        rotationSpeed: -5,
        style: fruit.style,
        isLeft: true,
        life: 1
      },
      {
        id: Math.random(),
        x: fruit.x,
        y: fruit.y,
        velocityX: Math.cos(sliceAngle * Math.PI / 180) * halfVelocity,
        velocityY: -5,
        rotation: sliceAngle,
        rotationSpeed: 5,
        style: fruit.style,
        isLeft: false,
        life: 1
      }
    ];
    setSlicedHalves(prev => [...prev, ...newHalves]);
    setFruits(prev => prev.map(f => f.id === fruit.id ? { ...f, isSliced: true } : f));

    if (isCorrect) {
      playSound('correct');
      setScore(s => s + 100 + (streak * 20));
      setStreak(st => st + 1);
      setResult('correct');
      setResultText(FLAVOR_TEXT.hit[Math.floor(Math.random() * FLAVOR_TEXT.hit.length)]);
    } else {
      playSound('wrong');
      setStreak(0);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setResult('wrong');
      setResultText(FLAVOR_TEXT.miss[Math.floor(Math.random() * FLAVOR_TEXT.miss.length)]);
    }

    setTimeout(() => {
      // Game Over Check
      if (currentIndex + 1 >= questions.length) {
         onGameOver({ 
           score: score + (isCorrect ? 100 : 0), 
           streak: 0, 
           questionsAnswered: currentIndex + 1, 
           correctAnswers: 0, 
           timeElapsed: 0, 
           level: 1 
         });
      } else {
        // Next Question
        setCurrentIndex(prev => prev + 1);
        setResult(null);
      }
    }, 1500);

  }, [questions, currentIndex, result, streak, playSound, onGameOver, score]);

  // 5. Draw Blade
  const drawBladeTrail = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();
    slicePointsRef.current = slicePointsRef.current.filter(p => now - p.time < 150);

    if (slicePointsRef.current.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(slicePointsRef.current[0].x, slicePointsRef.current[0].y);
    for (let i = 1; i < slicePointsRef.current.length; i++) {
       ctx.lineTo(slicePointsRef.current[i].x, slicePointsRef.current[i].y);
    }
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.stroke();

    ctx.strokeStyle = '#cyan';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 0;
    ctx.stroke();
  }, []);

  // 6. Physics Loop
  useEffect(() => {
    if (isPaused) return; // PAUSE CHECK

    const loop = (time: number) => {
      // Loop Spawn (Only runs if burst is finished)
      if (time - lastSpawnRef.current > SPAWN_INTERVAL) {
        spawnFruit();
        lastSpawnRef.current = time;
      }

      // Physics
      setFruits(prev => prev.map(f => {
         if (f.isSliced) return f;
         return {
           ...f,
           x: f.x + f.velocityX,
           y: f.y + f.velocityY,
           velocityY: f.velocityY + GRAVITY,
           rotation: f.rotation + f.rotationSpeed
         };
      }).filter(f => f.y < containerSize.height + 250)); // Allow to fall further before cleanup

      setSlicedHalves(prev => prev.map(h => ({
        ...h,
        x: h.x + h.velocityX,
        y: h.y + h.velocityY,
        velocityY: h.velocityY + GRAVITY,
        rotation: h.rotation + h.rotationSpeed,
        life: h.life - 0.02
      })).filter(h => h.life > 0));

      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.velocityX,
        y: p.y + p.velocityY,
        velocityY: p.velocityY + GRAVITY * 0.5,
        life: p.life - 0.03
      })).filter(p => p.life > 0));

      drawBladeTrail();

      // Collisions
      if (isSlicingRef.current && slicePointsRef.current.length > 1) {
         const p1 = slicePointsRef.current[slicePointsRef.current.length - 2];
         const p2 = slicePointsRef.current[slicePointsRef.current.length - 1];
         const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180/Math.PI);

         fruits.forEach(fruit => {
            if (!fruit.isSliced && lineIntersectsCircle(p1.x, p1.y, p2.x, p2.y, fruit.x, fruit.y, FRUIT_SIZE/2)) {
               handleSlice(fruit, angle);
            }
         });
      }
      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, containerSize, spawnFruit, handleSlice, fruits, drawBladeTrail]);


  const handleInputStart = () => isSlicingRef.current = true;
  const handleInputEnd = () => isSlicingRef.current = false;
  
  const handleInputMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || isPaused) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x, y;
    
    // Safety check for touches
    if ('touches' in e) {
      if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
      } else {
        return; // No touches active
      }
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    if (isSlicingRef.current) {
      slicePointsRef.current.push({ x, y, time: Date.now() });
    }
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setCurrentIndex(0);
    setFruits([]);
    setSlicedHalves([]);
    setParticles([]);
    setSpawnedOptions(new Set());
    setResult(null);
    setIsPaused(false);
    lastSpawnRef.current = Date.now() + 2000;
  };

  if (!student || questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-slate-900 overflow-hidden select-none touch-none cursor-crosshair ${isShaking ? 'animate-shake' : ''}`}
      onMouseDown={handleInputStart}
      onMouseMove={handleInputMove}
      onMouseUp={handleInputEnd}
      onTouchStart={handleInputStart}
      onTouchMove={handleInputMove}
      onTouchEnd={handleInputEnd}
    >
      <PauseMenu 
        onQuit={onExit || (() => {})} 
        onRestart={handleRestart}
        onResume={() => setIsPaused(false)}
      />

      <canvas ref={canvasRef} width={containerSize.width} height={containerSize.height} className="absolute inset-0 z-30 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      
      {/* UI Overlay */}
      <div className="absolute top-0 left-20 right-0 z-40 p-4 pointer-events-none">
         <div className="flex justify-between items-start">
             <div className="flex flex-col gap-2">
                 <div className="bg-black/50 backdrop-blur text-yellow-400 px-4 py-2 rounded-xl border border-yellow-500/30 flex items-center gap-2">
                    <Star className="fill-yellow-400 w-5 h-5"/>
                    <span className="font-black text-2xl">{score}</span>
                 </div>
                 {streak > 1 && (
                   <MotionDiv initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 w-fit">
                     <Zap size={14} className="fill-white"/> {streak}x Streak
                   </MotionDiv>
                 )}
             </div>

             <div className="bg-[#f3e5ab] text-slate-900 px-8 py-4 rounded shadow-2xl border-y-4 border-[#d4c59a] max-w-lg text-center transform -rotate-1">
                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{currentQ.subject}</div>
                 <h2 className="text-xl md:text-2xl font-black font-serif">"{currentQ.text}"</h2>
             </div>
         </div>
      </div>

      {/* Render Fruits */}
      {fruits.map(f => !f.isSliced && (
          <div key={f.id} className="absolute flex items-center justify-center rounded-full shadow-2xl border-4 pointer-events-none"
            style={{
              left: f.x - FRUIT_SIZE/2, top: f.y - FRUIT_SIZE/2,
              width: FRUIT_SIZE, height: FRUIT_SIZE,
              backgroundColor: f.style.inner, borderColor: f.style.outer,
              transform: `rotate(${f.rotation}deg) scale(${f.scale})`, zIndex: 10
            }}
          >
             <div className="absolute top-3 left-3 w-1/3 h-1/6 bg-white/40 rounded-full -rotate-45" />
             <span className="text-slate-900 font-black text-lg text-center leading-tight z-10 select-none" style={{ transform: `rotate(${-f.rotation}deg)` }}>
                {f.option}
             </span>
          </div>
      ))}

      {/* Render Sliced Halves */}
      {slicedHalves.map(h => (
         <div key={h.id} className="absolute overflow-hidden pointer-events-none"
           style={{
             left: h.x - FRUIT_SIZE/2, top: h.y - FRUIT_SIZE/2,
             width: FRUIT_SIZE, height: FRUIT_SIZE,
             transform: `rotate(${h.rotation}deg)`, opacity: h.life, zIndex: 5
           }}
         >
             <div className="w-full h-full rounded-full border-4 absolute top-0"
               style={{
                 backgroundColor: h.style.inner, borderColor: h.style.outer,
                 left: h.isLeft ? 0 : 0, 
                 clipPath: h.isLeft ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
               }}
             />
         </div>
      ))}

      {/* Render Particles */}
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{
            left: p.x, top: p.y, width: p.size, height: p.size,
            backgroundColor: p.color, opacity: p.life,
            boxShadow: p.isGlow ? `0 0 10px ${p.color}` : 'none'
          }}
        />
      ))}

      {/* Result Overlay */}
      <AnimatePresence>
        {result && (
          <MotionDiv initial={{ opacity: 0, scale: 0.5, y: 50 }} animate={{ opacity: 1, scale: 1.2, y: 0 }} exit={{ opacity: 0 }}
            className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none ${result === 'correct' ? 'text-green-400' : 'text-red-500'}`}
          >
            <h1 className="text-7xl font-black italic drop-shadow-2xl stroke-black">{resultText}</h1>
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NinjaSlice;
