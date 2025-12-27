
// games/types/gameTypes.ts
import { Question } from '../../types';

// ============================================
// GAME TYPES ENUM (Kept for reference or internal logic if needed)
// ============================================

export type GameType = 
  | 'target-shooter'    
  | 'bubble-pop'        
  | 'drag-drop'         
  | 'slider-select'     
  | 'memory-match'      
  | 'spin-wheel'        
  | 'catcher'           
  | 'maze-runner'       
  | 'jigsaw'            
  | 'timer-race'        
  | 'balance-scale'     
  | 'connect-dots'      
  | 'color-match'       
  | 'sorting-bins'      
  | 'story-interactive' 
  | 'whack-a-mole'      
  | 'racing-track'      
  | 'build-tower'       
  | 'treasure-hunt'     
  | 'penalty-kick'      
  | 'quick-tap';        

// ============================================
// PLAYER & PROGRESS TYPES
// ============================================

export interface PlayerProfile {
  name: string;
  grade: string;
  subject: string;
  chapter: string;
  difficulty: string;
  questionsCount: number;
  avatar?: string;
}

export interface PlayerProgress {
  currentQuestion: number;
  totalQuestions: number;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  streak: number;
  maxStreak: number;
  lives: number;
  maxLives: number;
  coins: number;
  xp: number;
}

// ============================================
// GAME COMPONENT PROPS
// ============================================

export interface MiniGameProps {
  question: Question;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  onTimeout?: () => void;
  timeLimit?: number;
  showHint?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}
