import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeBanner({ userName, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] mb-8"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      
      <div className="relative p-8 md:p-12">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-amber-300" />
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Welcome back, {userName}!
          </h2>
        </div>
        <p className="text-white/90 text-lg mb-6">
          Ready to continue your Torah learning journey?
        </p>
        <Button className="bg-white text-purple-600 hover:bg-white/90 font-bold rounded-2xl px-8">
          Continue Learning
        </Button>
      </div>
    </motion.div>
  );
}