
import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Subject } from './types';
import ArcherGame from './ArcherGame';
import BubblePopGame from './BubblePopGame';
import RocketGame from './RocketGame';
import NinjaGame from './NinjaGame';
import TreasureGame from './TreasureGame';
import BalloonGame from './BalloonGame';
import { Play, Settings, RotateCcw, Home } from 'lucide-react';

// ==========================================
// QUESTION BANK (40 Questions)
// ==========================================
const QUESTIONS: Question[] = [
  // MATH
  { id: '1', text: "5 + 3 = ?", options: ["7", "8", "9", "6"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '2', text: "10 - 4 = ?", options: ["5", "6", "4", "7"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '3', text: "3 x 3 = ?", options: ["6", "9", "12", "30"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '4', text: "Half of 20 is?", options: ["5", "15", "10", "2"], correctAnswer: 2, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '5', text: "Which is even?", options: ["3", "7", "2", "9"], correctAnswer: 2, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '6', text: "100 + 50 = ?", options: ["105", "150", "500", "10050"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '7', text: "Sides in a Triangle?", options: ["3", "4", "5", "2"], correctAnswer: 0, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '8', text: "50 cents + 50 cents?", options: ["$1.50", "$1.00", "$0.50", "$2.00"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '9', text: "12 / 4 = ?", options: ["4", "3", "2", "6"], correctAnswer: 1, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '10', text: "Smallest number?", options: ["10", "101", "1", "0"], correctAnswer: 3, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '11', text: "5 x 5 = ?", options: ["10", "20", "25", "55"], correctAnswer: 2, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '12', text: "20 - 9 = ?", options: ["11", "10", "12", "9"], correctAnswer: 0, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  { id: '13', text: "Double of 7?", options: ["12", "13", "14", "15"], correctAnswer: 2, subject: "Math", difficulty: 1, skill: "Math Basics", grade: "All" },
  
  // SCIENCE
  { id: '14', text: "Which animal lays eggs?", options: ["Dog", "Cat", "Chicken", "Cow"], correctAnswer: 2, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '15', text: "Color of the sun?", options: ["Blue", "Green", "Yellow", "Purple"], correctAnswer: 2, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '16', text: "Water turns to ice at?", options: ["100°C", "0°C", "50°C", "10°C"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '17', text: "Humans breathe in?", options: ["Oxygen", "Carbon", "Helium", "Water"], correctAnswer: 0, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '18', text: "A baby cat is a?", options: ["Puppy", "Kitten", "Cub", "Calf"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '19', text: "Planet we live on?", options: ["Mars", "Venus", "Earth", "Saturn"], correctAnswer: 2, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '20', text: "Bees make?", options: ["Milk", "Silk", "Honey", "Jam"], correctAnswer: 2, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '21', text: "Legs on a spider?", options: ["6", "8", "4", "10"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '22', text: "Fastest land animal?", options: ["Lion", "Cheetah", "Horse", "Rabbit"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '23', text: "Plants need sun and?", options: ["Water", "Cola", "Milk", "Juice"], correctAnswer: 0, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '24', text: "Largest ocean animal?", options: ["Shark", "Whale", "Octopus", "Seal"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '25', text: "Skeleton is made of?", options: ["Skin", "Bones", "Muscle", "Blood"], correctAnswer: 1, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },
  { id: '26', text: "Sun rises in the?", options: ["North", "South", "East", "West"], correctAnswer: 2, subject: "Science", difficulty: 1, skill: "Science Basics", grade: "All" },

  // ENGLISH
  { id: '27', text: "Opposite of 'Hot'?", options: ["Cold", "Warm", "Big", "Red"], correctAnswer: 0, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '28', text: "Rhymes with 'Cat'?", options: ["Dog", "Bat", "Car", "Ball"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '29', text: "Past tense of 'Run'?", options: ["Running", "Ran", "Runned", "Runs"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '30', text: "Plural of 'Mouse'?", options: ["Mouses", "Mice", "Micey", "Moose"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '31', text: "First letter of alphabet?", options: ["Z", "B", "A", "M"], correctAnswer: 2, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '32', text: "A person who teaches?", options: ["Doctor", "Teacher", "Pilot", "Chef"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '33', text: "Choose the noun:", options: ["Run", "Blue", "Apple", "Fast"], correctAnswer: 2, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '34', text: "Synonym for 'Happy'?", options: ["Sad", "Glad", "Mad", "Bad"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '35', text: "Vowel letter?", options: ["B", "C", "E", "F"], correctAnswer: 2, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '36', text: "Correct spelling?", options: ["Skool", "School", "Scool", "Sckool"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '37', text: "Antonym of 'Up'?", options: ["Down", "Left", "Right", "Above"], correctAnswer: 0, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '38', text: "Story book for words?", options: ["Dictionary", "Diary", "Atlas", "Album"], correctAnswer: 0, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '39', text: "Capital of India?", options: ["Mumbai", "Delhi", "Goa", "Agra"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
  { id: '40', text: "Frozen water is?", options: ["Steam", "Ice", "Rain", "Fog"], correctAnswer: 1, subject: "English", difficulty: 1, skill: "English Basics", grade: "All" },
];

const GAMES = [
  { id: 'archer', name: 'Archer Trap', icon: '🏹', color: 'bg-stone-800' },
  { id: 'bubble', name: 'Bubble Pop', icon: '🫧', color: 'bg-blue-500' },
  { id: 'rocket', name: 'Space Launch', icon: '🚀', color: 'bg-indigo-600' },
  { id: 'ninja', name: 'Dojo Slash', icon: '🥷', color: 'bg-red-700' },
  { id: 'treasure', name: 'Treasure Dig', icon: '💎', color: 'bg-amber-500' },
  { id: 'balloon', name: 'Balloon Pop', icon: '🎈', color: 'bg-sky-400' },
];

type GameType = 'archer' | 'bubble' | 'rocket' | 'ninja' | 'treasure' | 'balloon';

const GameController: React.FC = () => {
  const [screen, setScreen] = useState<'menu' | 'playing' | 'result'>('menu');
  const [selectedGame, setSelectedGame] = useState<GameType>('archer');
  
  // Settings
  const [subject, setSubject] = useState<Subject>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  
  // Game State
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);

  const startGame = () => {
    // Filter and Shuffle Questions
    let qs = QUESTIONS.filter(q => subject === 'All' || q.subject === subject);
    
    // Shuffle
    qs = qs.sort(() => Math.random() - 0.5);
    
    // Slice to count
    qs = qs.slice(0, questionCount);

    if (qs.length === 0) {
        alert("No questions available for this filter!");
        return;
    }

    setGameQuestions(qs);
    setScore(0);
    setLives(3);
    setStreak(0);
    setCurrentQIndex(0);
    setScreen('playing');
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
       setScore(s => s + 100 + (streak * 10));
       setStreak(s => s + 1);
       nextTurn();
    } else {
       setStreak(0);
       setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
             setScreen('result');
          } else {
             nextTurn();
          }
          return newLives;
       });
    }
  };

  const nextTurn = () => {
     if (currentQIndex + 1 >= gameQuestions.length) {
         setTimeout(() => setScreen('result'), 1000);
     } else {
         setCurrentQIndex(prev => prev + 1);
     }
  };

  const getCurrentGameComponent = () => {
     let gameId = selectedGame;
     if (randomMode) {
        const games: GameType[] = ['archer', 'bubble', 'rocket', 'ninja', 'treasure', 'balloon'];
        gameId = games[Math.floor(Math.random() * games.length)];
     }

     const props = {
        question: gameQuestions[currentQIndex],
        onAnswer: handleAnswer,
        score,
        lives,
        streak,
        questionNumber: currentQIndex + 1,
        totalQuestions: gameQuestions.length
     };

     switch(gameId) {
        case 'archer': return <ArcherGame {...props} />;
        case 'bubble': return <BubblePopGame {...props} />;
        case 'rocket': return <RocketGame {...props} />;
        case 'ninja': return <NinjaGame {...props} />;
        case 'treasure': return <TreasureGame {...props} />;
        case 'balloon': return <BalloonGame {...props} />;
        default: return <ArcherGame {...props} />;
     }
  };

  // --- MENU SCREEN ---
  if (screen === 'menu') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-4 font-sans flex items-center justify-center">
         <div className="max-w-4xl w-full bg-slate-800 rounded-3xl p-8 shadow-2xl border-4 border-slate-700">
            <h1 className="text-4xl md:text-6xl font-black text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
               QUEST ARCADE
            </h1>
            <p className="text-center text-slate-400 mb-8 font-bold">CHOOSE YOUR CHALLENGE</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Game Selection */}
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700">
                  <h3 className="font-bold text-slate-300 mb-4 flex items-center gap-2"><Play size={20} /> SELECT GAME</h3>
                  <div className="grid grid-cols-2 gap-3">
                     {GAMES.map(g => (
                        <button 
                           key={g.id}
                           onClick={() => { setSelectedGame(g.id as GameType); setRandomMode(false); }}
                           className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2
                              ${selectedGame === g.id && !randomMode ? 'border-white bg-slate-700' : 'border-transparent hover:bg-slate-800'}
                           `}
                        >
                           <span className="text-3xl">{g.icon}</span>
                           <span className="text-xs font-bold uppercase">{g.name}</span>
                        </button>
                     ))}
                     <button 
                        onClick={() => setRandomMode(true)}
                        className={`col-span-2 p-3 rounded-xl flex items-center justify-center gap-2 font-bold border-2
                           ${randomMode ? 'bg-gradient-to-r from-pink-500 to-orange-500 border-white' : 'bg-slate-800 border-slate-700'}
                        `}
                     >
                        🎲 RANDOM MIX MODE
                     </button>
                  </div>
               </div>

               {/* Settings */}
               <div className="bg-slate-900 p-6 rounded-2xl border-2 border-slate-700 flex flex-col gap-6">
                  <div>
                     <h3 className="font-bold text-slate-300 mb-3 flex items-center gap-2"><Settings size={20} /> SUBJECT</h3>
                     <div className="flex gap-2">
                        {(['All', 'Math', 'Science', 'English'] as Subject[]).map(s => (
                           <button
                              key={s}
                              onClick={() => setSubject(s)}
                              className={`flex-1 py-2 rounded-lg font-bold text-sm ${subject === s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                           >
                              {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h3 className="font-bold text-slate-300 mb-3">QUESTIONS</h3>
                     <div className="flex gap-2">
                        {[5, 10, 15, 20].map(c => (
                           <button
                              key={c}
                              onClick={() => setQuestionCount(c)}
                              className={`flex-1 py-2 rounded-lg font-bold text-sm ${questionCount === c ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                           >
                              {c}
                           </button>
                        ))}
                     </div>
                  </div>

                  <button 
                     onClick={startGame}
                     className="mt-auto w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
                  >
                     START GAME <Play fill="currentColor" />
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  }

  // --- PLAYING SCREEN ---
  if (screen === 'playing') {
     return (
        <div className="h-screen w-full bg-black flex items-center justify-center p-4">
           <div className="w-full max-w-5xl h-full max-h-[800px] relative">
              {getCurrentGameComponent()}
              
              {/* Emergency Exit */}
              <button 
                 onClick={() => setScreen('menu')}
                 className="absolute top-4 left-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                 title="Quit Game"
              >
                 <Home size={20} />
              </button>
           </div>
        </div>
     );
  }

  // --- RESULT SCREEN ---
  return (
     <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-3xl text-center shadow-2xl border-4 border-slate-700">
           <div className="text-8xl mb-4 animate-bounce">
              {lives > 0 ? '🏆' : '💀'}
           </div>
           
           <h2 className="text-5xl font-black mb-2">
              {lives > 0 ? 'VICTORY!' : 'GAME OVER'}
           </h2>
           
           <div className="text-slate-400 mb-8 font-bold text-xl">
              {lives > 0 ? 'Mission Accomplished' : 'Better luck next time!'}
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                 <div className="text-sm text-slate-500 font-bold">SCORE</div>
                 <div className="text-3xl font-black text-yellow-400">{score}</div>
              </div>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                 <div className="text-sm text-slate-500 font-bold">ACCURACY</div>
                 <div className="text-3xl font-black text-green-400">
                    {Math.round((score / (questionCount * 150)) * 100)}%
                 </div>
              </div>
           </div>

           <div className="flex gap-4">
              <button 
                 onClick={() => setScreen('menu')}
                 className="flex-1 py-3 bg-slate-700 rounded-xl font-bold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                 <Home size={20} /> MENU
              </button>
              <button 
                 onClick={startGame}
                 className="flex-1 py-3 bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2"
              >
                 <RotateCcw size={20} /> REPLAY
              </button>
           </div>
        </div>
     </div>
  );
};

export default GameController;
