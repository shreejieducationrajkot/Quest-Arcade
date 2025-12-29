
// ==========================================
// 🚫 AI DISABLED - MOCK SERVICE
// This file replaces the Google Gemini API.
// No API Key is required.
// ==========================================

export interface DiagnosticAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  encouragement: string;
}

export const analyzePerformance = async (
  name: string,
  grade: string,
  history: { skill: string; correct: boolean; timeTaken: number }[]
): Promise<DiagnosticAnalysis> => {
  // Simulate a short "thinking" delay for realism
  await new Promise(resolve => setTimeout(resolve, 600));

  const total = history.length;
  const correctCount = history.filter(h => h.correct).length;
  // Calculate percentage safely
  const percentage = total > 0 ? (correctCount / total) * 100 : 0;

  // 1. Identify Strengths (Unique skills from correct answers)
  const strengthSet = new Set(history.filter(h => h.correct).map(h => h.skill));
  let strengths = Array.from(strengthSet).slice(0, 3);
  if (strengths.length === 0) strengths = ["Persistence", "Effort"];

  // 2. Identify Weaknesses (Unique skills from incorrect answers)
  const weaknessSet = new Set(history.filter(h => !h.correct).map(h => h.skill));
  let weaknesses = Array.from(weaknessSet).slice(0, 2);
  if (weaknesses.length === 0) weaknesses = ["None! Perfect run."];

  // 3. Recommendation Logic
  let recommendation = "";
  if (percentage >= 90) {
    recommendation = "You've mastered this! Challenge yourself with the next difficulty level.";
  } else if (percentage >= 70) {
    recommendation = "Great work! Review the few missed questions to achieve perfection.";
  } else if (percentage >= 50) {
    recommendation = "You're getting there! Focus on accuracy over speed in the next round.";
  } else {
    recommendation = "Take your time. Read each question carefully and try again.";
  }

  // 4. Encouragement Logic (Mock AI Persona)
  let encouragement = "";
  if (percentage >= 90) {
    encouragement = `Incredible! You are a Master! 🌟`;
  } else if (percentage >= 75) {
    encouragement = `Great job! You have strong skills. 🚀`;
  } else if (percentage >= 50) {
    encouragement = `Good effort! Keep practicing! 👍`;
  } else {
    encouragement = `Don't give up! Every mistake is a lesson. 💪`;
  }

  return {
    strengths,
    weaknesses,
    recommendation,
    encouragement
  };
};
