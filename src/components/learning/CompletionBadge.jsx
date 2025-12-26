import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompletionBadge({ type = 'bronze', animated = true }) {
  const badges = {
    bronze: { icon: Award, color: 'from-amber-700 to-amber-900', label: 'Bronze' },
    silver: { icon: Star, color: 'from-slate-400 to-slate-600', label: 'Silver' },
    gold: { icon: Trophy, color: 'from-amber-400 to-amber-600', label: 'Gold' },
    platinum: { icon: Crown, color: 'from-blue-400 to-purple-600', label: 'Platinum' },
  };

  const badge = badges[type];
  const Icon = badge.icon;

  return (
    <motion.div
      whileHover={animated ? { scale: 1.1, rotate: 5 } : {}}
      className="inline-block"
    >
      <div className={`bg-gradient-to-br ${badge.color} rounded-2xl p-4 shadow-xl`}>
        <div className="flex flex-col items-center gap-2">
          <Icon className="w-12 h-12 text-white" />
          <span className="text-white font-bold text-sm">{badge.label}</span>
        </div>
      </div>
    </motion.div>
  );
}