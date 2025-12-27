
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert pedagogical AI Diagnostic Engine with deep expertise in childhood psychology and educational scaffolding.
      
      STUDENT PROFILE:
      - Name: ${name}
      - Grade Level: ${grade}
      
      PERFORMANCE DATA:
      ${JSON.stringify(history)}
      
      ANALYTICAL TASK:
      1. Deep Thinking Phase: Before providing the answer, reason through the student's error patterns. Are the mistakes due to conceptual misunderstanding, time-pressure anxiety, or specific sub-skill gaps?
      2. Identify 3 specific sub-skills where the student demonstrated mastery.
      3. Identify 2 critical areas for focused intervention.
      4. Craft a specialized 7-day study recommendation plan summarized in one clear sentence.
      5. Write a highly motivating, age-appropriate encouragement message that references their specific effort.
      
      FORMAT REQUIREMENTS:
      - Return strictly as a JSON object matching the defined schema.
      - Strengths and weaknesses must be concise (2-4 words each).`,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Specific sub-skills where performance was high" 
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING }, 
              description: "Identified learning gaps or anxiety patterns" 
            },
            recommendation: { 
              type: Type.STRING, 
              description: "Actionable 7-day intervention plan summary" 
            },
            encouragement: { 
              type: Type.STRING, 
              description: "Motivating psychological reinforcement message" 
            },
          },
          required: ["strengths", "weaknesses", "recommendation", "encouragement"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      strengths: ["Concept Recognition", "Rapid Response"],
      weaknesses: ["Complex Reasoning", "Accuracy under Pressure"],
      recommendation: "Focus on fundamental practice for 10 minutes daily to strengthen conceptual accuracy.",
      encouragement: "Fantastic effort! Your focus is truly impressive. Keep up the great work!"
    };
  }
};
