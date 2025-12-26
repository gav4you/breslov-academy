import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function XPProgressBar({ currentXP, nextLevelXP, level }) {
  const percentage = (currentXP / nextLevelXP) * 100;

  return (
    <div className="glass-effect border-0 premium-shadow-lg rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className="font-bold text-slate-900">Level {level}</span>
        </div>
        <div className="text-sm text-slate-600">
          <span className="font-bold text-slate-900">{currentXP}</span> / {nextLevelXP} XP
        </div>
      </div>

      <div className="relative h-4 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 relative"
        >
          <div className="absolute inset-0 bg-white/20 animate-shimmer" />
        </motion.div>
        <motion.div
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <TrendingUp className="w-3 h-3 text-white drop-shadow-lg" />
        </motion.div>
      </div>

      <div className="mt-2 text-xs text-slate-600 text-center">
        {nextLevelXP - currentXP} XP to next level
      </div>
    </div>
  );
}