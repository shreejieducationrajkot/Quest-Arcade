
import { Question as GlobalQuestion } from '../types';

export type Subject = 'Math' | 'Science' | 'English' | 'All';

export type Question = GlobalQuestion;

export interface GameProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  score: number;
  lives: number;
  streak: number;
  questionNumber: number;
  totalQuestions: number;
}
