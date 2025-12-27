
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index 0-3
  difficulty: number; // 1-3 scale (1: Easy, 2: Medium, 3: Hard)
  skill: string; // Previously topic
  grade: string; // "3", "4", ... "12"
  subject?: string;
  damage?: number; // RPG Damage value
}

export interface StudentProfile {
  name: string;
  grade: string;
  avatar: string;
}

export interface GameState {
  score: number;
  streak: number;
  questionsAnswered: number;
  correctAnswers: number;
  timeElapsed: number;
  level: number; // Concept Developer, Master, etc.
}

export type GameModeType = 
  | 'RACE' 
  | 'TOWER' 
  | 'BATTLE' 
  | 'ARCHER' 
  | 'PENALTY'
  | 'BUBBLE'
  | 'TARGET'
  | 'MEMORY'
  | 'CATCHER'
  | 'TIMER'
  | 'NINJA_SLICE'
  | 'TREASURE_DIVER'
  | 'DRAGON_TRAINER'
  | 'MAZE_ESCAPE'
  | 'ZOO_BUILDER'
  | 'GHOST_HUNT'
  | 'GARDEN_GROWER'
  | 'MONSTER_ALBUM'
  | 'ROCKET_LAUNCH'
  | 'DETECTIVE_CASE'
  | 'JIGSAW_REVEAL'
  | 'COOKING_MASTER'
  | 'RACE_TRACK';

export interface GameModeConfig {
  id: GameModeType;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface GameResult extends GameState {
  history: {
    questionId: string;
    correct: boolean;
    timeTaken: number;
  }[];
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  avatar: string; // Emoji or image URL
  theme: 'fantasy' | 'cyber' | 'space';
}

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  turn: 'player' | 'enemy' | 'animation';
  message: string;
}
