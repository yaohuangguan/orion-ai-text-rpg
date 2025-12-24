import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, Activity } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { ThemeStyles } from '../utils/theme';

interface InputAreaProps {
  onSend: (text: string) => void;
  choices: string[];
  disabled: boolean;
  isThinking: boolean;
  lang: Language;
  styles: ThemeStyles;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, choices, disabled, isThinking, lang, styles }) => {
  const [input, setInput] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      triggerAnimation();
      onSend(input);
      setInput('');
    }
  };

  const handleChoice = (choice: string) => {
    if (!disabled) {
      triggerAnimation();
      onSend(choice);
    }
  };

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  return (
    <div className={`flex flex-col gap-4 w-full max-w-3xl mx-auto transition-transform duration-150 ${isAnimating ? 'translate-y-2 scale-95 opacity-80' : ''}`}>
      {/* Suggestions */}
      {!disabled && choices.length > 0 && !isThinking && (
        <div className="flex flex-wrap gap-2 justify-center fade-in">
          {choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleChoice(choice)}
              className={`px-4 py-2 bg-black/40 border ${styles.accentBorder} ${styles.accent} text-sm hover:bg-white/10 transition-all rounded-sm flex items-center gap-2 hover:-translate-y-0.5`}
            >
              <ChevronRight size={14} />
              {choice}
            </button>
          ))}
        </div>
      )}

      {/* Thinking Indicator */}
      {isThinking && (
         <div className="flex items-center justify-center gap-2 text-pink-500 py-2 animate-pulse">
            <Activity size={18} className="animate-spin" />
            <span className={`${styles.fontHead} uppercase tracking-widest text-sm`}>Processing...</span>
         </div>
      )}

      {/* Text Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder={disabled ? t.waiting : t.inputPlaceholder}
          className={`w-full bg-black/60 border border-zinc-700 text-white px-6 py-4 pr-12 rounded-sm focus:outline-none focus:border-${styles.accentBorder.split('-')[1]} focus:ring-1 focus:ring-white/20 transition-all disabled:opacity-50 ${styles.fontHead} shadow-lg`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 ${styles.accent} hover:text-white disabled:opacity-30 transition-colors transform hover:scale-110 active:scale-90`}
        >
          <Send size={20} />
        </button>
        
        {/* Decorative corner lines - only for cyberpunk/tech themes usually, but looks cool generally */}
        {styles.fontHead.includes('mono') && (
           <>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           </>
        )}
      </form>
    </div>
  );
};

export default InputArea;
