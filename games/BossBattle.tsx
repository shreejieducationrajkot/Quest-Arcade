
import React, { useState, useEffect } from 'react';
import { GameState, StudentProfile, Enemy, BattleState, Question } from '../types';
import BattleArena from './components/BattleArena';
import AttackPad from './components/AttackPad';
import { ENEMIES } from '../constants';
import { getQuestionsForGrade } from '../QuestionBank';

interface BossBattleProps {
  student: StudentProfile;
  customQuestions?: Question[] | null;
  onGameOver: (result: GameState) => void;
}

const BossBattle: React.FC<BossBattleProps> = ({ student, customQuestions, onGameOver }) => {
  // Initialize random enemy
  const [enemy, setEnemy] = useState<Enemy>(() => {
    const randomIndex = Math.floor(Math.random() * ENEMIES.length);
    return { ...ENEMIES[randomIndex] };
  });

  // Game Stats
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    streak: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    timeElapsed: 0,
    level: 1
  });

  // Battle State - Player HP removed logic
  const [battleState, setBattleState] = useState<BattleState>({
    playerHp: 100, // Cosmetic only
    playerMaxHp: 100,
    turn: 'player', // 'player' | 'enemy' | 'animation'
    message: `A wild ${enemy.name} appears!`
  });
  
  const [specialCharge, setSpecialCharge] = useState(0);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [lastAction, setLastAction] = useState<{ 
    type: 'damage' | 'heal' | 'miss' | null; 
    value: number; 
    target: 'player' | 'enemy';
    isCritical?: boolean;
    isUltimate?: boolean;
  }>({ type: null, value: 0, target: 'enemy', isCritical: false });
  
  // Track used questions to prevent repeats
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());

  // Fetch questions for the specific grade from the Question Bank OR Custom
  const allPlayableQuestions = customQuestions && customQuestions.length > 0 
      ? customQuestions 
      : (student ? getQuestionsForGrade(student.grade) : []);

  // Init
  useEffect(() => {
    if (student) {
      loadNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student, customQuestions]);

  const loadNextQuestion = () => {
    if (allPlayableQuestions.length === 0 || usedQuestionIds.size >= allPlayableQuestions.length) {
      // Game Over if no more questions
      onGameOver(gameState);
      return;
    }

    // Filter out used questions
    const availableQuestions = allPlayableQuestions.filter(q => !usedQuestionIds.has(q.id));
    
    if (availableQuestions.length === 0) {
        onGameOver(gameState);
        return;
    }

    const randomQ = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    
    // Mark as used
    setUsedQuestionIds(prev => new Set(prev).add(randomQ.id));
    
    // Assign damage if not present
    const qWithDamage = { ...randomQ, damage: randomQ.damage || 20 };
    setCurrentQuestion(qWithDamage);
  };

  const handlePlayerAttack = (optionIndex: number) => {
    if (!currentQuestion || battleState.turn !== 'player') return;

    // Handle empty bank exit
    if (currentQuestion.id === 'empty') {
        onGameOver(gameState);
        return;
    }

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const damage = currentQuestion.damage || 20;

    // 1. Lock UI
    setBattleState(prev => ({ ...prev, turn: 'animation', message: isCorrect ? "Charging attack..." : "Attack missed!" }));

    if (isCorrect) {
      // CORRECT ANSWER SEQUENCE
      setTimeout(() => {
        setLastAction({ type: 'damage', value: damage, target: 'enemy', isCritical: true });
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));
        setBattleState(prev => ({ ...prev, message: "Critical Hit!" }));
        
        setGameState(prev => ({
          ...prev,
          score: prev.score + (damage * 10),
          streak: prev.streak + 1,
          correctAnswers: prev.correctAnswers + 1,
          questionsAnswered: prev.questionsAnswered + 1
        }));
        setSpecialCharge(prev => Math.min(100, prev + 25));
      }, 500);

      setTimeout(() => {
        if (enemy.hp - damage <= 0) {
           handleWin();
        } else {
           setBattleState(prev => ({ ...prev, turn: 'player', message: "Your turn!" }));
           loadNextQuestion();
        }
        setLastAction({ type: null, value: 0, target: 'enemy' });
      }, 2500);

    } else {
      // WRONG ANSWER SEQUENCE - NO GAME OVER
      setTimeout(() => {
        setLastAction({ type: 'miss', value: 0, target: 'enemy' });
        setBattleState(prev => ({ ...prev, message: "You missed! Enemy is attacking!" }));
        
        setGameState(prev => ({
          ...prev,
          streak: 0,
          questionsAnswered: prev.questionsAnswered + 1
        }));
      }, 500);

      setTimeout(() => {
        const enemyDmg = 15;
        setLastAction({ type: 'damage', value: enemyDmg, target: 'player', isCritical: false });
        setBattleState(prev => ({ 
            ...prev, 
            message: `${enemy.name} hits you for ${enemyDmg} damage!`
        }));
      }, 1500);

      setTimeout(() => {
        // Just recover and continue
        setBattleState(prev => ({ ...prev, turn: 'player', message: "Recover and strike back!" }));
        setLastAction({ type: null, value: 0, target: 'enemy' });
        loadNextQuestion();
      }, 3000);
    }
  };

  const handleSpecialAttack = () => {
    if (specialCharge < 100 || battleState.turn !== 'player') return;

    setBattleState(prev => ({ ...prev, turn: 'animation', message: "UNLEASHING ULTIMATE POWER!" }));
    
    const ultDamage = 100;

    setTimeout(() => {
        setLastAction({ type: 'damage', value: ultDamage, target: 'enemy', isUltimate: true });
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - ultDamage) }));
        setBattleState(prev => ({ ...prev, message: "ULTIMATE BLAST!!!" }));
        setSpecialCharge(0);

        setGameState(prev => ({
            ...prev,
            score: prev.score + 500
        }));
    }, 1000);

    setTimeout(() => {
        if (enemy.hp - ultDamage <= 0) {
            handleWin();
        } else {
            setBattleState(prev => ({ ...prev, turn: 'player', message: "Enemy is stunned! Keep attacking!" }));
            loadNextQuestion();
        }
        setLastAction({ type: null, value: 0, target: 'enemy' });
    }, 4000);
  };

  const handleWin = () => {
     setBattleState(prev => ({ ...prev, message: "VICTORY!" }));
     setTimeout(() => {
         onGameOver({ ...gameState, score: gameState.score + 1000 });
     }, 2000);
  };

  if (!student) return null;

  return (
    <div className="flex flex-col h-full w-full bg-slate-900">
      <div className="flex-1 min-h-[50%] relative">
        <BattleArena 
          student={student} 
          enemy={enemy} 
          battleState={battleState} 
          lastAction={lastAction}
          score={gameState.score}
          streak={gameState.streak}
        />
      </div>

      <div className="relative z-30">
        {currentQuestion && (
           <AttackPad 
             question={currentQuestion} 
             onAttack={handlePlayerAttack} 
             disabled={battleState.turn !== 'player'}
             specialCharge={specialCharge}
             onSpecialAttack={handleSpecialAttack}
           />
        )}
      </div>
    </div>
  );
};

export default BossBattle;
