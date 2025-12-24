import React, { useState, useEffect, useRef } from 'react';
import { TextStyleType } from '../types';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  style?: TextStyleType;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 10, onComplete, style = 'normal' }) => {
  // If speed is 0 initially, show text immediately
  const [displayedText, setDisplayedText] = useState(speed === 0 ? text : '');
  const index = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track previous text to know when to reset
  const prevTextRef = useRef(text);

  useEffect(() => {
    // Clear any existing timeout on update
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 1. Handle Text Change: Reset everything
    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      index.current = 0;
      if (speed === 0) {
        setDisplayedText(text);
        if (onComplete) onComplete();
        return;
      } else {
        setDisplayedText('');
      }
    } 
    // 2. Handle Speed Update (specifically to 0): Complete immediately
    else if (speed === 0 && displayedText !== text) {
      setDisplayedText(text);
      if (onComplete) onComplete();
      return;
    }
    // 3. If text matched and speed is 0, do nothing (already displayed)
    else if (speed === 0) {
      return;
    }

    // 4. Typing Logic (if speed > 0)
    // Dynamic speed calculation
    let actualSpeed = text.length > 300 ? 5 : speed;
    if (style === 'system_log') actualSpeed = 5;
    if (style === 'corrupted') actualSpeed = 30;

    const type = () => {
      if (index.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index.current));
        index.current++;
        
        // Auto-scroll
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        const jitter = style === 'corrupted' ? Math.random() * 50 : 0;
        timeoutRef.current = window.setTimeout(type, actualSpeed + jitter);
      } else {
        if (onComplete) onComplete();
      }
    };

    // Only start typing if we aren't already done or speed isn't 0 (handled above)
    if (displayedText.length < text.length && speed > 0) {
      type();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, style]);

  const getStyleClass = () => {
    switch (style) {
      case 'corrupted': return 'text-style-corrupted tracking-wider';
      case 'system_log': return 'text-style-system text-sm';
      default: return 'text-gray-200';
    }
  };

  return (
    <div ref={containerRef} className={`leading-relaxed whitespace-pre-wrap font-light relative ${getStyleClass()}`}>
      {displayedText}
      {index.current < text.length && speed > 0 && (
        <span className={`inline-block w-2 h-5 ml-0.5 align-middle animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)] ${style === 'corrupted' ? 'bg-red-500' : 'bg-cyan-500'}`}></span>
      )}
    </div>
  );
};

export default TypewriterText;
