
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { useSound } from './components/SoundManager';
import { Lock, Skull, Footprints, Sparkles } from 'lucide-react';

interface MazeEscapeProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
}

const MotionDiv = motion.div as any;

const MazeEscape: React.FC<MazeEscapeProps> = ({ student, customQuestions, onGameOver }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Game Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Game State
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [doorStatus, setDoorStatus] = useState<'locked' | 'opening' | 'open' | 'slam'>('locked');
  const [isTransitioning, setIsTransitioning] = useState(false); // For the "Zoom in" effect
  
  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  // Mouse Spotlight State
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

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
  }, [student, customQuestions]);

  // 2. Spotlight Logic
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  // 3. Interaction Logic
  const handleDoorClick = (index: number) => {
    if (selectedDoor !== null) return; 

    setSelectedDoor(index);
    setDoorStatus('opening');

    const currentQ = questions[currentIndex];
    const isCorrect = index === currentQ.correctAnswer;

    // A. Door Opens
    setTimeout(() => {
      setDoorStatus('open');
      
      if (isCorrect) {
        // --- CORRECT SEQUENCE ---
        playSound('correct');
        setScore(s => s + 100 + (streak * 20));
        setStreak(s => s + 1);

        // B. Walk Through Animation (Zoom into the door)
        setTimeout(() => {
          setIsTransitioning(true); // Triggers the screen scale
        }, 300);

      } else {
        // --- WRONG SEQUENCE ---
        playSound('wrong');
        setStreak(0);

        // Slam Door and continue
        setTimeout(() => {
          setDoorStatus('slam');
        }, 1000); 
      }

      // Next Level Logic (for both correct and incorrect)
      setTimeout(() => {
          if (currentIndex + 1 >= questions.length) {
            onGameOver({ score: score + (isCorrect ? 100 : 0), streak, questionsAnswered: currentIndex + 1, correctAnswers: 0, timeElapsed: 0, level: 1 });
          } else {
            setCurrentIndex(prev => prev + 1);
            setSelectedDoor(null);
            setDoorStatus('locked');
            setIsTransitioning(false); // Reset Zoom
          }
      }, 1500);

    }, 400); // Door creak duration
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full bg-black overflow-hidden flex flex-col font-sans select-none perspective-[1000px]"
    >
      
      {/* === LAYER 1: DYNAMIC BACKGROUND & SPOTLIGHT === */}
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-1000"
        style={{
          background: `radial-gradient(circle 600px at ${mousePos.x}% ${mousePos.y}%, #1e293b 0%, #000000 100%)`
        }}
      >
        {/* Floating Dust Particles */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
        
        {/* Floor Grid with Perspective */}
        <div 
            className="absolute bottom-0 left-[-50%] right-[-50%] h-[50vh] opacity-20"
            style={{
                backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                transform: 'rotateX(60deg) translateY(0px)',
                maskImage: 'linear-gradient(to top, black, transparent)'
            }}
        ></div>
      </div>


      {/* === LAYER 2: THE ROOM (SCALES UP ON SUCCESS) === */}
      <MotionDiv 
        className="relative z-10 w-full h-full flex flex-col items-center justify-center"
        animate={isTransitioning 
          ? { scale: 4, opacity: 0, y: 100, filter: 'blur(10px)' } 
          : { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }
        }
        transition={{ duration: 1.2, ease: "easeInOut" }}
        // Determine origin based on selected door to "walk into" that specific door
        style={{ transformOrigin: selectedDoor !== null ? `${25 + (selectedDoor * 25)}% 60%` : 'center' }}
      >

        {/* --- HUD --- */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white/50 z-20">
            <div className="flex gap-2 items-center text-sm font-mono border border-white/10 px-3 py-1 rounded-full bg-black/40">
                <Lock size={14} /> ROOM {currentIndex + 1}
            </div>
        </div>

        {/* --- QUESTION TABLET --- */}
        <div className="mb-10 max-w-3xl w-full text-center relative group">
             {/* Glowing Rune Background */}
             <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
             <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-lg shadow-2xl">
                 <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md tracking-wide">
                    {currentQ.text}
                 </h2>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-500/50 blur-sm rounded-full"></div>
             </div>
        </div>


        {/* --- THE DOORS CONTAINER --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 w-full max-w-6xl px-4 items-end h-[320px]">
            {currentQ.options.map((option, index) => {
                const isSelected = selectedDoor === index;
                const isCorrect = index === currentQ.correctAnswer;
                
                return (
                    <div 
                        key={index}
                        className="relative w-full h-full perspective-[800px] cursor-pointer group"
                        onClick={() => handleDoorClick(index)}
                    >
                        {/* 1. Door Frame (Static) */}
                        <div className="absolute inset-0 bg-[#0f172a] border-t-8 border-x-8 border-[#334155] rounded-t-full shadow-2xl flex items-center justify-center overflow-hidden z-0">
                             
                             {/* WHAT IS BEHIND THE DOOR? */}
                             <div className="absolute inset-0 flex items-center justify-center">
                                 {isSelected && doorStatus !== 'locked' ? (
                                     isCorrect ? (
                                         // SUCCESS: Volumetric Light Shafts
                                         <div className="relative w-full h-full bg-cyan-100 flex items-center justify-center overflow-hidden">
                                             <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50"></div>
                                             {/* Light Beams */}
                                             <MotionDiv initial={{ rotate: 0 }} animate={{ rotate: 45 }} className="absolute w-[200%] h-20 bg-white/30 blur-2xl top-1/2 -left-1/2"></MotionDiv>
                                             <MotionDiv initial={{ rotate: 0 }} animate={{ rotate: -45 }} className="absolute w-[200%] h-20 bg-white/30 blur-2xl top-1/2 -left-1/2"></MotionDiv>
                                             <Footprints className="relative z-10 w-16 h-16 text-cyan-900 opacity-60" />
                                         </div>
                                     ) : (
                                         // FAILURE: The Void / Monster
                                         <div className="w-full h-full bg-[#1a0505] flex flex-col items-center justify-center shadow-inner relative">
                                             <div className="absolute inset-0 bg-red-900/20 animate-pulse"></div>
                                             <Skull className="w-20 h-20 text-red-600 drop-shadow-[0_0_15px_red] animate-bounce" />
                                             <div className="mt-4 text-red-500 font-mono text-xs tracking-widest">DEAD END</div>
                                         </div>
                                     )
                                 ) : (
                                     // Closed Dark Room
                                     <div className="w-full h-full bg-black"></div>
                                 )}
                             </div>
                        </div>

                        {/* 2. The Door Panel (Animated) */}
                        <MotionDiv
                            className={`absolute inset-0 bg-[#1e293b] rounded-t-[calc(100%_-_8px)] border-4 border-[#475569] flex flex-col items-center justify-center p-4 z-10 origin-left transform-style-3d shadow-black`}
                            // Glowing border on hover
                            style={{ boxShadow: isSelected ? 'none' : 'inset 0 0 20px #000' }}
                            animate={
                                isSelected 
                                ? (doorStatus === 'open' || doorStatus === 'opening' 
                                    ? { rotateY: -105 } // Open wide
                                    : doorStatus === 'slam' 
                                        ? { rotateY: [0, -10, 0] } // Shake/Slam
                                        : { rotateY: 0 })
                                : { rotateY: 0 }
                            }
                            transition={{ duration: 0.6, type: "spring", stiffness: 50 }}
                        >
                             {/* Neon Circuit Lines on Door */}
                             <div className={`absolute inset-4 border-2 border-dashed rounded-t-full opacity-30 ${isSelected ? 'border-cyan-400 opacity-80 shadow-[0_0_10px_cyan]' : 'border-slate-500'}`}></div>
                             
                             {/* Door Knob */}
                             <div className="absolute right-3 top-1/2 w-4 h-4 bg-slate-400 rounded-full shadow-md border border-slate-600 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_cyan] transition-colors"></div>

                             {/* Option Badge */}
                             <div className="mb-6 w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center text-slate-400 font-bold bg-slate-900/50 group-hover:border-cyan-500 group-hover:text-cyan-400 transition-colors">
                                 {['A', 'B', 'C', 'D'][index]}
                             </div>

                             {/* Answer Text */}
                             <span className="text-slate-200 font-bold text-center text-lg leading-tight group-hover:text-white transition-colors">
                                 {option}
                             </span>
                        </MotionDiv>
                        
                        {/* Floor Reflection/Shadow */}
                        <div className="absolute -bottom-6 left-0 right-0 h-4 bg-black/60 blur-lg rounded-[50%] transform scale-x-90"></div>

                    </div>
                );
            })}
        </div>

      </MotionDiv>

    </div>
  );
};

export default MazeEscape;
