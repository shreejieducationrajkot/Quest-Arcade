
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { 
  GameLayout, 
  PauseModal, 
  ResultModal, 
  CorrectAnswer, 
  WrongAnswer, 
  EncouragementToast, 
  XPAnimation 
} from '../ui'; // Imports from root ui/index.ts
import { useSound } from './components/SoundManager';

// --- Types & Constants ---
interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  optionIndex: number;
  text: string;
  color: string;
  popped: boolean;
}

const COLORS = [
  'bg-pink-500 border-pink-400',
  'bg-blue-500 border-blue-400',
  'bg-green-500 border-green-400',
  'bg-yellow-500 border-yellow-400',
  'bg-purple-500 border-purple-400',
  'bg-cyan-500 border-cyan-400',
];

interface BubblePopProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
}

const BubblePop: React.FC<BubblePopProps> = ({ student, customQuestions, onGameOver }) => {
  // Game State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  
  // UI State
  const [isPaused, setIsPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showXP, setShowXP] = useState(false);

  // Bubbles State
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [startTime] = useState(Date.now());
  const { playSound } = useSound();

  // Load Questions
  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5));
    }
  }, [student, customQuestions]);

  // Init Bubbles for current question
  useEffect(() => {
    if (!questions[currentQIndex]) return;
    
    const newBubbles: Bubble[] = questions[currentQIndex].options.map((option, idx) => ({
      id: idx,
      x: 15 + (idx % 2) * 45 + Math.random() * 20,
      y: 80 + Math.random() * 10,
      size: 80 + Math.random() * 20,
      speed: 0.2 + (level * 0.05) + Math.random() * 0.2,
      optionIndex: idx,
      text: option,
      color: COLORS[idx % COLORS.length],
      popped: false,
    }));
    setBubbles(newBubbles);
    setFeedback(null);
  }, [currentQIndex, questions, level]);

  // Game Loop
  useEffect(() => {
    if (isPaused || showResult || feedback) return;

    const interval = setInterval(() => {
      setBubbles(prev => prev.map(bubble => {
        if (bubble.popped) return bubble;
        let newY = bubble.y - bubble.speed;
        let newX = bubble.x + Math.sin(Date.now() / 1000 + bubble.id) * 0.3;
        
        // Loop if goes off screen
        if (newY < -20) {
          newY = 100;
          newX = 15 + Math.random() * 70;
        }
        
        return { ...bubble, y: newY, x: Math.max(5, Math.min(85, newX)) };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, showResult, feedback]);

  const handleBubblePop = (bubble: Bubble) => {
    if (isPaused || bubble.popped || feedback) return;

    const currentQ = questions[currentQIndex];
    const isCorrect = bubble.optionIndex === currentQ.correctAnswer;

    // Visual pop
    playSound('pop');
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, popped: true } : b));

    if (isCorrect) {
      // Success Logic
      playSound('correct');
      const streakBonus = streak * 10;
      const points = 100 + streakBonus;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setXp(prev => prev + 20);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
      setFeedback('correct');

      // Toast Logic
      if (streak === 2) setToastMessage("Three in a row!");
      if (streak === 4) setToastMessage("Unstoppable!");
    } else {
      // Fail Logic
      playSound('wrong');
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
        setFeedback(null);
        if (currentQIndex + 1 >= questions.length) {
          playSound('win');
          setShowResult(true);
        } else {
          setCurrentQIndex(prev => prev + 1);
        }
    }, 1500);
  };

  const handleFinish = () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    onGameOver({
      score,
      streak,
      questionsAnswered: questions.length,
      correctAnswers,
      timeElapsed: timeTaken,
      level
    });
  };

  if (questions.length === 0) return <div className="text-white p-10 font-bold text-center">Loading bubbles...</div>;

  return (
    <GameLayout
      onPause={() => setIsPaused(true)}
      level={level}
      currentXP={xp}
      maxXP={level * 100}
      lives={3} // Constant, not used for logic anymore
      streak={streak}
      score={score}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-blue-100 z-0"></div>

      {/* Question Header */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-20 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-8 py-6 rounded-[2rem] shadow-xl border-4 border-white text-center">
             <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight mb-2 font-comic">
                {questions[currentQIndex].text}
             </h2>
             <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                Tap the correct bubble!
             </p>
        </div>
      </div>

      {/* Bubbles Area */}
      <div className="w-full h-full relative overflow-hidden z-10">
        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            onClick={() => handleBubblePop(bubble)}
            disabled={bubble.popped}
            className={`
              absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95
              ${bubble.popped ? 'scale-0 opacity-0 duration-300' : 'hover:scale-110 duration-200'}
            `}
            style={{
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
            }}
          >
            <div className={`
              w-full h-full rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.2)] 
              border-b-8 border-r-4 flex items-center justify-center backdrop-blur-sm
              ${bubble.color}
            `}>
              <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/60 rounded-full blur-[1px]" />
              <div className="absolute top-1/3 left-1/5 w-1 h-1 bg-white/60 rounded-full blur-[1px]" />
              <span className="text-white font-black text-lg drop-shadow-md px-2 leading-tight text-center">
                {bubble.text}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* UI Overlays */}
      <CorrectAnswer show={feedback === 'correct'} />
      <WrongAnswer show={feedback === 'wrong'} />
      <EncouragementToast message={toastMessage} onClear={() => setToastMessage(null)} />
      <XPAnimation amount={20} show={showXP} />

      {/* Modals */}
      <PauseModal 
        isOpen={isPaused} 
        onResume={() => setIsPaused(false)}
        onRestart={() => window.location.reload()} 
        onQuit={handleFinish}
      />

      {showResult && (
        <ResultModal 
          score={score}
          correctCount={correctAnswers}
          totalQuestions={questions.length}
          onReplay={() => window.location.reload()}
          onNext={handleFinish}
        />
      )}

    </GameLayout>
  );
};

export default BubblePop;
