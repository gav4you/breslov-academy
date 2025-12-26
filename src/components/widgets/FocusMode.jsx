import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FocusMode({ children }) {
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsFocused(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <>
      <Button
        onClick={() => setIsFocused(!isFocused)}
        variant="outline"
        size="sm"
        className="rounded-xl"
      >
        {isFocused ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
        Focus Mode
      </Button>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900 overflow-auto"
          >
            <div className="max-w-4xl mx-auto p-8">
              <Button
                onClick={() => setIsFocused(false)}
                variant="ghost"
                size="icon"
                className="fixed top-4 right-4 text-white hover:bg-white/10 rounded-full"
              >
                <X className="w-6 h-6" />
              </Button>
              <div className="mt-16 text-white">
                {children}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}