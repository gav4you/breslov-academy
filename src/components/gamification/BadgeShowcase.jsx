import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BadgeShowcase() {
  const badges = [
    { name: 'First Steps', icon: '🎯', unlocked: true, color: 'from-blue-500 to-blue-600' },
    { name: 'Week Warrior', icon: '🔥', unlocked: true, color: 'from-orange-500 to-red-600' },
    { name: 'Torah Scholar', icon: '📖', unlocked: true, color: 'from-green-500 to-green-600' },
    { name: 'Master', icon: '👑', unlocked: false, color: 'from-purple-500 to-purple-600' },
    { name: 'Legend', icon: '⭐', unlocked: false, color: 'from-amber-500 to-amber-600' },
    { name: 'Sage', icon: '🌟', unlocked: false, color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Badge Collection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {badges.map((badge, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1, type: 'spring' }}
              whileHover={badge.unlocked ? { scale: 1.1, rotate: 5 } : {}}
              className="relative"
            >
              <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-4 ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.color} shadow-xl`
                  : 'bg-slate-200'
              }`}>
                {badge.unlocked ? (
                  <>
                    <div className="text-5xl mb-2">{badge.icon}</div>
                    <div className="text-white font-bold text-xs text-center">{badge.name}</div>
                  </>
                ) : (
                  <>
                    <Lock className="w-8 h-8 text-slate-400 mb-2" />
                    <div className="text-slate-500 font-bold text-xs text-center">{badge.name}</div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          {badges.filter(b => b.unlocked).length} of {badges.length} unlocked
        </div>
      </CardContent>
    </Card>
  );
}