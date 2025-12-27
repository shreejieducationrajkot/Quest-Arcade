import { Question } from '../types';
import { GRADE_3_QUESTIONS } from './Grade3';
import { GRADE_4_QUESTIONS } from './Grade4';
import { GRADE_5_QUESTIONS } from './Grade5';
import { GRADE_6_QUESTIONS } from './Grade6';
import { GRADE_7_QUESTIONS } from './Grade7';
import { GRADE_10_QUESTIONS } from './Grade10';

const QUESTION_MAP: Record<string, Question[]> = {
  '3': GRADE_3_QUESTIONS,
  '4': GRADE_4_QUESTIONS,
  '5': GRADE_5_QUESTIONS,
  '6': GRADE_6_QUESTIONS,
  '7': GRADE_7_QUESTIONS,
  '10': GRADE_10_QUESTIONS,
};

export const getQuestionsForGrade = (grade: string): Question[] => {
  const questions = QUESTION_MAP[grade];
  
  if (!questions) {
    console.warn(`No questions found for Grade ${grade}`);
    return [];
  }
  
  return questions;
};

// Also export by number for the new game engine
export const getQuestionsByGrade = (grade: number): Question[] => {
  return getQuestionsForGrade(grade.toString());
};

export const shuffleQuestions = (questions: Question[]): Question[] => {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export type { Question }; // Ensure type is exported if imported from here