
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Question } from '../types';
import { getQuestionsForGrade } from '../QuestionBank';
import { Trophy, Brain, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
}

interface Card {
  id: number;
  content: string;
  isCorrect: boolean;
  isFlipped: boolean;
  isMatched: boolean;
}

// --- Game Component ---
const MemoryMatchGameComponent: React.FC<MiniGameProps> = ({ question, onAnswer }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [wrongFlip, setWrongFlip] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  // Initialize grid
  useEffect(() => {
    const correctText = question.options[question.correctAnswer];
    const wrongOptions = question.options.filter((_, i) => i !== question.correctAnswer);
    
    // Create deck: 3 correct cards
    let deck: Card[] = Array(3).fill(null).map((_, i) => ({
      id: i,
      content: correctText,
      isCorrect: true,
      isFlipped: false,
      isMatched: false
    }));

    // Add 9 distractors
    for (let i = 0; i < 9; i++) {
      deck.push({
        id: i + 3,
        content: wrongOptions[i % wrongOptions.length],
        isCorrect: false,
        isFlipped: false,
        isMatched: false
      });
    }

    // Shuffle
    deck = deck.sort(() => Math.random() - 0.5);
    setCards(deck);
    setMatchedCount(0);
    setGameActive(true);
  }, [question]);

  const handleCardClick = (clickedCard: Card) => {
    if (!gameActive || clickedCard.isFlipped || clickedCard.isMatched || wrongFlip) return;

    // Flip
    const newCards = cards.map(c => c.id === clickedCard.id ? { ...c, isFlipped: true } : c);
    setCards(newCards);

    if (clickedCard.isCorrect) {
      // Correct Logic
      setMatchedCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          setGameActive(false);
          setTimeout(() => onAnswer(question.correctAnswer, true), 1000);
        }
        return newCount;
      });
      
      // Mark Matched
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, isMatched: true } : c));
      }, 500);

    } else {
      // Wrong Logic
      setWrongFlip(true);
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === clickedCard.id ? { ...c, isFlipped: false } : c));
        setWrongFlip(false);
        setGameActive(false);
        // On wrong flip, proceed to next question as wrong answer
        setTimeout(() => onAnswer(question.correctAnswer, false), 800);
      }, 1000);
    }
  };

  return (
    <div className="w-full h-[600px] bg-violet-900 rounded-3xl p-6 flex flex-col items-center border-4 border-violet-700 shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">{question.text}</h2>
        <div className="text-violet-300 text-sm font-bold uppercase tracking-wider">Find 3 matching cards!</div>
        <div className="flex gap-2 justify-center mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full transition-colors ${i < matchedCount ? 'bg-green-400' : 'bg-slate-600'}`} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full max-w-md aspect-square">
        {cards.map((card) => (
          <div key={card.id} className="relative w-full h-full perspective-1000" onClick={() => handleCardClick(card)}>
            <motion.div
              className="w-full h-full relative preserve-3d"
              initial={false}
              animate={{ rotateY: card.isFlipped ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Back */}
              <div className="absolute inset-0 bg-indigo-600 rounded-xl border-2 border-indigo-400 shadow-md flex items-center justify-center backface-hidden cursor-pointer hover:bg-indigo-500">
                <span className="text-3xl opacity-50 text-white font-black">?</span>
              </div>

              {/* Front */}
              <div 
                className={`absolute inset-0 rounded-xl border-4 shadow-md flex items-center justify-center p-2 text-center text-xs font-bold backface-hidden select-none
                  ${card.isCorrect 
                    ? (card.isMatched ? 'bg-green-500 border-green-300 text-white' : 'bg-white border-green-500 text-green-700') 
                    : 'bg-red-500 border-red-300 text-white'}`}
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
              >
                {card.content}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main Wrapper ---
interface MemoryMatchProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ student, customQuestions, onGameOver }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    if (customQuestions && customQuestions.length > 0) {
      setQuestions(customQuestions);
    } else {
      if (!student) return;
      const qs = getQuestionsForGrade(student.grade);
      setQuestions(qs.sort(() => Math.random() - 0.5));
    }
  }, [student, customQuestions]);

  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    if (isGameOver) return;

    if (isCorrect) {
      setScore(prev => prev + 200);
      setCorrectAnswers(prev => prev + 1);
    } 
    
    // Always move to next
    setTimeout(() => {
        if (currentQIndex + 1 >= questions.length) {
            setIsGameOver(true);
            setTimeout(() => {
                onGameOver({
                    score,
                    streak: 0,
                    questionsAnswered: questions.length,
                    correctAnswers,
                    timeElapsed: (Date.now() - startTime) / 1000,
                    level: 1
                });
            }, 1000);
        } else {
            setCurrentQIndex(prev => (prev + 1) % questions.length);
        }
    }, 1500); 
  };

  if (questions.length === 0) return <div className="text-center p-10 text-white">Loading Cards...</div>;

  return (
    <div className="w-full min-h-screen bg-violet-950 flex flex-col font-sans">
       <div className="bg-violet-900 p-4 shadow-lg flex justify-between items-center text-white border-b-4 border-violet-800">
           <button onClick={() => setIsGameOver(true)} className="p-2 hover:bg-violet-800 rounded-full"><ArrowLeft /></button>
           <div className="flex gap-6">
               <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl"><Brain className="text-pink-400"/> Memory Challenge</div>
               <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl"><Trophy className="text-yellow-400"/> 
                 <motion.span 
                   key={score}
                   initial={{ scale: 1.5, color: '#facc15' }}
                   animate={{ scale: 1, color: '#ffffff' }}
                   className="font-bold"
                 >
                   {score}
                 </motion.span>
               </div>
           </div>
           <div></div>
       </div>

       <div className="flex-1 flex items-center justify-center p-4">
           {!isGameOver && questions[currentQIndex] && (
               <div className="w-full max-w-2xl">
                   <MemoryMatchGameComponent 
                      key={currentQIndex}
                      question={questions[currentQIndex]}
                      onAnswer={handleAnswer}
                   />
               </div>
           )}
       </div>
    </div>
  );
};

export default MemoryMatch;
