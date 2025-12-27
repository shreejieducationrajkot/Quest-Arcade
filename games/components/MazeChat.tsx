
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export type MessageType = 'guide' | 'system' | 'reaction';

export interface ChatMessage {
  id: string;
  text: string;
  type: MessageType;
}

interface MazeChatProps {
  messages: ChatMessage[];
  actions: { label: string; onClick: () => void }[];
  isTyping?: boolean;
}

const MotionDiv = motion.div as any;

const MazeChat: React.FC<MazeChatProps> = ({ messages, actions, isTyping = false }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <MotionDiv 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 z-50 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.15)] overflow-hidden pointer-events-auto">
        
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-950/50 border-b border-indigo-500/20">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_cyan]"></div>
          <span className="text-[10px] font-black text-indigo-300 tracking-[0.2em] uppercase">Guide Link_v3.0</span>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="p-4 max-h-[150px] overflow-y-auto scrollbar-hide space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MotionDiv
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${msg.type === 'system' ? 'items-center' : 'items-start'}`}
              >
                {msg.type === 'guide' && (
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-tr-xl rounded-bl-xl rounded-br-xl px-3 py-2 text-sm text-indigo-100 shadow-sm backdrop-blur-sm relative">
                    <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-1 -left-1" />
                    {msg.text}
                  </div>
                )}
                
                {msg.type === 'system' && (
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest py-1">
                    {msg.text}
                  </span>
                )}

                {msg.type === 'reaction' && (
                  <span className="text-xs font-medium text-cyan-400 italic px-2">
                    * {msg.text} *
                  </span>
                )}
              </MotionDiv>
            ))}
            {isTyping && (
              <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 px-2 py-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        {actions.length > 0 && (
          <div className="p-3 bg-indigo-950/30 border-t border-indigo-500/20 flex flex-wrap gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="flex-1 min-w-fit px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all hover:shadow-[0_0_10px_rgba(99,102,241,0.4)] active:scale-95 whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </MotionDiv>
  );
};

export default MazeChat;
