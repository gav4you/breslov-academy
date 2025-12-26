import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Volume2, VolumeX } from 'lucide-react';

export default function FocusMode({ content, onExit }) {
  const [isActive, setIsActive] = useState(false);
  const [backgroundSound, setBackgroundSound] = useState(false);

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  return (
    <>
      <Button
        onClick={() => setIsActive(true)}
        variant="outline"
        size="sm"
        className="rounded-xl"
      >
        <Maximize2 className="w-4 h-4 mr-2" />
        Focus Mode
      </Button>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950"
          >
            {/* Ambient background */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400 rounded-full blur-[150px] animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                onClick={() => setBackgroundSound(!backgroundSound)}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white rounded-xl"
              >
                {backgroundSound ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => {
                  setIsActive(false);
                  onExit?.();
                }}
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white rounded-xl"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="max-w-4xl w-full">
                <div className="glass-effect border-white/10 rounded-[3rem] p-12 shadow-2xl">
                  <div className="prose prose-invert prose-lg max-w-none">
                    {content}
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient sound indicator */}
            {backgroundSound && (
              <div className="absolute bottom-4 left-4 text-white/50 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Ambient Torah study sounds
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}