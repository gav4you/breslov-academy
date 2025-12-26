import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function MotivationalQuote() {
  const quotes = [
    "The main thing is not to be afraid at all",
    "Judge every person favorably",
    "The world is full of wonders",
    "Never despair",
    "Everything is for the good"
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-30 max-w-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="glass-morphism rounded-2xl px-6 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-medium italic">"{quotes[currentQuote]}"</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}