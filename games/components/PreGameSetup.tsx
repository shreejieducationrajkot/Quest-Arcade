
import React, { useState } from 'react';
import { StudentProfile, Question } from '../../types';
import { AVATARS } from '../../constants';
import { ArrowRight, UserCircle, GraduationCap, Upload, FileJson, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface PreGameSetupProps {
  onComplete: (profile: StudentProfile, customQuestions?: Question[] | null) => void;
  gameTitle: string;
}

const MotionDiv = motion.div as any;
const MotionH2 = motion.h2 as any;
const MotionButton = motion.button as any;

const DEMO_QUESTIONS = [
  {
    "id": "demo-1",
    "text": "What is the capital of France?",
    "options": ["London", "Berlin", "Paris", "Madrid"],
    "correctAnswer": 2, // Index 2 = Paris
    "subject": "Geography",
    "difficulty": 1
  },
  {
    "id": "demo-2",
    "text": "Which number is even?",
    "options": ["1", "3", "4", "7"],
    "correctAnswer": 2, // Index 2 = 4
    "subject": "Math",
    "difficulty": 1
  }
];

const PreGameSetup: React.FC<PreGameSetupProps> = ({ onComplete, gameTitle }) => {
  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    grade: '10',
    avatar: AVATARS[0]
  });
  const [customQuestions, setCustomQuestions] = useState<Question[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (Array.isArray(json) && json.every((q: any) => q.text && Array.isArray(q.options) && typeof q.correctAnswer === 'number')) {
             const validQuestions = json.map((q: any, i: number) => ({
               id: q.id || `custom-${i}`,
               text: q.text,
               options: q.options,
               correctAnswer: q.correctAnswer,
               difficulty: q.difficulty || 1,
               skill: q.skill || 'Custom',
               grade: q.grade || 'All',
               subject: q.subject || 'General'
             })) as Question[];
             setCustomQuestions(validQuestions);
             setFileName(file.name);
          } else {
            alert("Invalid JSON format. Must be an array of questions with 'text', 'options', and 'correctAnswer'.");
            setCustomQuestions(null);
            setFileName(null);
          }
        } catch (err) {
          alert("Error parsing JSON file.");
          setCustomQuestions(null);
          setFileName(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadDemo = () => {
    const jsonString = JSON.stringify(DEMO_QUESTIONS, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "demo_questions.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name.trim()) {
      onComplete(profile, customQuestions);
    }
  };

  return (
    <MotionDiv 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
        <div className="relative z-10">
          <MotionH2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-black mb-1"
          >
            Setup Profile
          </MotionH2>
          <p className="opacity-80 text-sm font-medium">Playing: {gameTitle}</p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <MotionDiv
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <UserCircle size={18} className="text-indigo-600"/> Your Name
          </label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
            placeholder="Enter your name"
            value={profile.name}
            onChange={(e) => setProfile({...profile, name: e.target.value})}
          />
        </MotionDiv>

        <MotionDiv
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <GraduationCap size={18} className="text-indigo-600"/> Class
          </label>
          <div className="relative">
            <select 
              className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white appearance-none focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-medium text-slate-800"
              value={profile.grade}
              onChange={(e) => setProfile({...profile, grade: e.target.value})}
            >
              {[3,4,5,6,7,8,9,10,11,12].map(g => <option key={g} value={g.toString()}>Class {g}</option>)}
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </MotionDiv>

        {/* File Upload Section */}
        <MotionDiv
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors"
        >
           <input
            type="file"
            accept=".json"
            id="question-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="question-upload" className="cursor-pointer flex flex-col items-center gap-2 text-slate-600 hover:text-indigo-600">
            {fileName ? (
               <div className="flex items-center gap-2 text-green-600">
                 <FileJson size={24} />
                 <span className="font-bold text-sm truncate max-w-[200px]">{fileName}</span>
               </div>
            ) : (
               <>
                 <Upload size={24} />
                 <span className="font-bold text-sm">Upload Custom Questions (JSON)</span>
               </>
            )}
          </label>
          {customQuestions && (
            <p className="text-xs text-green-600 font-bold mt-2">
              {customQuestions.length} questions loaded successfully!
            </p>
          )}
          
          <div className="mt-3 pt-3 border-t border-slate-200/60">
             <button 
               type="button"
               onClick={handleDownloadDemo}
               className="text-xs font-bold text-indigo-500 hover:text-indigo-700 flex items-center justify-center gap-1 mx-auto transition-colors"
             >
               <Download size={14} /> Download Demo Format
             </button>
          </div>
        </MotionDiv>

        <MotionDiv
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-bold text-slate-700 mb-2">Choose Avatar</label>
          <div className="flex flex-wrap gap-3 justify-center bg-slate-50 p-4 rounded-xl border border-slate-100">
            {AVATARS.map(avatar => (
              <MotionButton
                key={avatar}
                type="button"
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setProfile({...profile, avatar})}
                className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center transition-all ${profile.avatar === avatar ? 'bg-white shadow-md ring-2 ring-indigo-500 scale-110' : 'grayscale opacity-70 hover:grayscale-0 hover:opacity-100'}`}
              >
                {avatar}
              </MotionButton>
            ))}
          </div>
        </MotionDiv>

        <MotionButton 
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-4 text-lg"
        >
          START GAME <ArrowRight size={24} strokeWidth={3} />
        </MotionButton>
      </form>
    </MotionDiv>
  );
};

export default PreGameSetup;
