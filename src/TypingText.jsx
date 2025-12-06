import React, { useState, useEffect } from 'react';
import { playTypewriterSound } from './utils/keyboardSound';

export default function TypingText({ text, speed = 20, onComplete, interruptKey }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (canceled) return;
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
        
        // Play sound for visible characters (not whitespace)
        const char = text[currentIndex];
        if (char && char.trim()) {
          playTypewriterSound();
        }
        // notify terminal to keep at bottom while animating
        try { window.dispatchEvent(new Event('terminal-typing-tick')); } catch {}
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, canceled]);

  useEffect(() => {
    if (interruptKey !== undefined) {
      setCanceled(true);
    }
  }, [interruptKey]);

  useEffect(() => {
    // reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setCanceled(false);
  }, [text]);

  return <>{displayedText}</>;
} 
