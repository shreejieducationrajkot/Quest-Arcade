
import React, { useEffect, useState } from 'react';
import { GameResult, StudentProfile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RotateCcw, Home, Award, Star, Sparkles, Brain } from 'lucide-react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { analyzePerformance, DiagnosticAnalysis } from '../services/aiService';

interface ResultsViewProps {
  result: GameResult;
  student: StudentProfile;
  onReset: () => void;
  onHome: () => void;
}

const MotionSpan = motion.span as any;
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;

const AnimatedCounter = ({ value, className }: { value: number, className?: string }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 10, duration: 1000 } as any);
  const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <MotionSpan className={className}>{display}</MotionSpan>;
};

const ResultsView: React.FC<ResultsViewProps> = ({ result, student, onReset, onHome }) => {
  const [aiAnalysis, setAiAnalysis] = useState<DiagnosticAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoadingAI(true);
      // Map history to include skill names for better context, casting to any to bypass type check
      const analysis = await analyzePerformance(student.name, student.grade, result.history as any);
      setAiAnalysis(analysis);
      setLoadingAI(false);
    };

    if (result.history.length > 0) {
      fetchAnalysis();
    } else {
      setLoadingAI(false);
    }
  }, [result.history, student]);

  const percentage = Math.round((result.correctAnswers / Math.max(result.questionsAnswered, 1)) * 100);
  
  const data = [
    { name: 'Accuracy', value: percentage, color: '#8884d8' },
    { name: 'Speed', value: Math.min(100, Math.max(20, 100 - (result.timeElapsed / (result.questionsAnswered || 1)))), color: '#82ca9d' },
    { name: 'Focus', value: Math.min(100, 50 + (result.streak * 5)), color: '#ffc658' },
  ];

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden mb-10"
    >
      <div className="bg-slate-900 text-white p-12 text-center relative overflow-hidden">
        <MotionDiv 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.2, type: "spring" }}
           className="relative z-10"
        >
            <div className="flex justify-center gap-2 mb-4">
               {[1,2,3].map(i => (
                 <MotionDiv 
                   key={i} 
                   initial={{ scale: 0 }} 
                   animate={{ scale: 1 }} 
                   transition={{ delay: 0.5 + (i * 0.1) }}
                 >
                   <Star className="text-yellow-400 fill-yellow-400 w-12 h-12" />
                 </MotionDiv>
               ))}
            </div>
            <h1 className="text-5xl font-black mb-2 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">
              Mission Complete!
            </h1>
            <p className="text-indigo-200 text-xl">Fantastic work, {student.name}!</p>
            
            <div className="flex justify-center mt-10 gap-16">
                <div className="text-center">
                    <div className="text-5xl font-black">
                        <AnimatedCounter value={result.score} />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider opacity-60 mt-1">Total Score</div>
                </div>
                <div className="text-center">
                    <div className="text-5xl font-black">
                        <AnimatedCounter value={result.correctAnswers} />/<AnimatedCounter value={result.questionsAnswered} />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider opacity-60 mt-1">Questions</div>
                </div>
                <div className="text-center">
                    <div className="text-5xl font-black text-orange-400 flex items-center justify-center gap-2">
                        🔥 <AnimatedCounter value={result.streak} />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider opacity-60 mt-1">Best Streak</div>
                </div>
            </div>
        </MotionDiv>
        
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Metrics */}
        <MotionDiv 
           initial={{ x: -50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ delay: 0.7 }}
           className="bg-slate-50 p-6 rounded-3xl border border-slate-100"
        >
            <h3 className="text-xl font-bold text-slate-700 mb-6 flex items-center gap-2">
                <Award className="text-indigo-500" /> Performance Metrics
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barSize={40}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{fill: 'transparent'}} 
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </MotionDiv>

        {/* AI Diagnostic Text */}
        <MotionDiv 
           initial={{ x: 50, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ delay: 0.8 }}
           className="flex flex-col"
        >
            <div className="bg-indigo-900 rounded-2xl p-4 mb-4 flex items-center gap-3">
              <Sparkles className="text-yellow-400" />
              <span className="text-white font-black text-sm uppercase tracking-widest">AI Sensei Analysis</span>
            </div>

            <div className="flex-1 space-y-4">
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                  <MotionDiv 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Brain size={48} />
                  </MotionDiv>
                  <p className="font-bold animate-pulse">Analyzing performance patterns...</p>
                </div>
              ) : (
                <AnimatePresence>
                  <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex gap-4 items-start">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0">
                           <Award size={20} />
                        </div>
                        <div>
                           <span className="font-bold text-emerald-900 block mb-1">Strengths</span>
                           <p className="text-sm text-emerald-700 leading-relaxed">
                              {aiAnalysis?.strengths.join(", ") || "Great consistency and focus."}
                           </p>
                        </div>
                    </div>
                    
                    <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex gap-4 items-start">
                         <div className="bg-amber-100 p-2 rounded-lg text-amber-600 shrink-0">
                           <Brain size={20} />
                        </div>
                        <div>
                           <span className="font-bold text-amber-900 block mb-1">Focus Areas</span>
                           <p className="text-sm text-amber-700 leading-relaxed">
                              {aiAnalysis?.weaknesses.join(", ") || "Review recently missed topics."}
                           </p>
                        </div>
                    </div>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 italic text-indigo-700 text-sm">
                      "{aiAnalysis?.encouragement}"
                    </div>
                  </MotionDiv>
                </AnimatePresence>
              )}
            </div>

            <div className="flex gap-4 mt-8">
                <MotionButton 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={onHome} 
                   className="flex-1 py-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                    <Home size={20} /> Menu
                </MotionButton>
                <MotionButton 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={onReset} 
                   className="flex-1 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <RotateCcw size={20} /> Play Again
                </MotionButton>
            </div>
        </MotionDiv>
      </div>
    </MotionDiv>
  );
};

export default ResultsView;
