import React, { useEffect, useState } from 'react';
import { GameResult, StudentProfile } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RotateCcw, Home, Award, Star, Sparkles, Brain, CheckCircle, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
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

const AnalysisCard = ({ title, icon, colorClass, bgClass, items }: { title: string, icon: React.ReactNode, colorClass: string, bgClass: string, items: string[] }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgClass} rounded-2xl border border-opacity-50 overflow-hidden shadow-sm`}
    >
      <div 
        className="p-5 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/60 ${colorClass}`}>{icon}</div>
          <h4 className={`font-black text-lg ${colorClass.replace('text-', 'text-opacity-90 text-')}`}>{title}</h4>
        </div>
        <div className={`${colorClass} opacity-60`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            <ul className="space-y-3">
              {items.map((item, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-3 font-medium ${colorClass.replace('text-', 'text-opacity-80 text-')}`}
                >
                  <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-current`} /> 
                  <span className="leading-snug">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ResultsView: React.FC<ResultsViewProps> = ({ result, student, onReset, onHome }) => {
  const [aiAnalysis, setAiAnalysis] = useState<DiagnosticAnalysis | null>(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoadingAI(true);
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
      className="w-full max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden mb-10 border-4 border-white"
    >
      {/* Hero Header */}
      <div className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
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
                   <Star className="text-yellow-400 fill-yellow-400 w-10 h-10 drop-shadow-lg" />
                 </MotionDiv>
               ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-500 drop-shadow-sm">
              Mission Complete
            </h1>
            <p className="text-slate-400 font-bold text-lg tracking-wide">Excellent effort, {student.name}!</p>
            
            <div className="flex flex-wrap justify-center mt-8 gap-8 md:gap-16">
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black tabular-nums">
                        <AnimatedCounter value={result.score} />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">Total Score</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black tabular-nums">
                        <AnimatedCounter value={percentage} />%
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">Accuracy</div>
                </div>
                <div className="text-center">
                    <div className="text-4xl md:text-5xl font-black text-orange-400 flex items-center justify-center gap-2 tabular-nums">
                        <AnimatedCounter value={result.streak} />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest opacity-50 mt-1">Best Streak</div>
                </div>
            </div>
        </MotionDiv>
        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-slate-50">
        
        {/* Left Column: Metrics & Actions */}
        <div className="flex flex-col gap-6">
            <MotionDiv 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
            >
                <h3 className="text-lg font-black text-slate-700 mb-6 flex items-center gap-2">
                    <Award className="text-indigo-500" size={20} /> Skill Metrics
                </h3>
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} barSize={40} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                            <YAxis hide />
                            <Tooltip 
                              cursor={{fill: '#f1f5f9', radius: 8}} 
                              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                            />
                            <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </MotionDiv>

            <div className="flex gap-4 mt-auto">
                <MotionButton 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={onHome} 
                   className="flex-1 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                >
                    <Home size={20} /> Menu
                </MotionButton>
                <MotionButton 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={onReset} 
                   className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
                >
                    <RotateCcw size={20} /> Replay
                </MotionButton>
            </div>
        </div>

        {/* Right Column: AI Analysis */}
        <MotionDiv 
           initial={{ x: 20, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-50/50"
        >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                 <Sparkles size={24} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-800">AI Diagnostic Report</h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Powered by Gemini</p>
              </div>
            </div>

            <div className="space-y-4">
              {loadingAI ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                  <MotionDiv 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="p-4 bg-slate-50 rounded-full"
                  >
                    <Brain size={32} className="text-indigo-400" />
                  </MotionDiv>
                  <p className="font-bold animate-pulse text-sm">Analyzing gameplay patterns...</p>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    
                    {/* Strengths */}
                    <AnalysisCard 
                      title="Superpowers" 
                      icon={<CheckCircle size={20} />} 
                      colorClass="text-emerald-600" 
                      bgClass="bg-emerald-50 border-emerald-100"
                      items={aiAnalysis?.strengths || ["Consistent accuracy", "Quick reflexes"]}
                    />

                    {/* Weaknesses */}
                    <AnalysisCard 
                      title="Focus Areas" 
                      icon={<Target size={20} />} 
                      colorClass="text-rose-600" 
                      bgClass="bg-rose-50 border-rose-100"
                      items={aiAnalysis?.weaknesses || ["Complex problem solving", "Time management"]}
                    />

                    {/* Recommendation */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-100 relative overflow-hidden"
                    >
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Lightbulb size={64} />
                       </div>
                       <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold">
                          <Lightbulb size={18} /> <span>Smart Plan</span>
                       </div>
                       <p className="text-slate-700 font-medium leading-relaxed relative z-10">
                          {aiAnalysis?.recommendation || "Focus on daily practice to build consistency."}
                       </p>
                    </motion.div>

                    {/* Encouragement Quote */}
                    <div className="text-center pt-2">
                       <p className="text-sm font-bold text-slate-400 italic">
                         "{aiAnalysis?.encouragement}"
                       </p>
                    </div>

                  </motion.div>
                </AnimatePresence>
              )}
            </div>
        </MotionDiv>
      </div>
    </MotionDiv>
  );
};

export default ResultsView;