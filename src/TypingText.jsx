import React, { useState, useEffect } from 'react';
import { playTypewriterSound } from './utils/keyboardSound';

export default function TypingText({ text, speed = 20, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Play sound for visible characters (not whitespace)
        const char = text[currentIndex];
        if (char && char.trim()) {
          playTypewriterSound();
        }
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <>{displayedText}</>;
} 