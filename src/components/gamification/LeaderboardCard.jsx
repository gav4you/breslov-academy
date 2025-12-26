import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardCard({ timeframe = 'week' }) {
  const topLearners = [
    { rank: 1, name: 'Sarah Cohen', xp: 8420, avatar: 'S', icon: Crown, color: 'from-amber-400 to-amber-600' },
    { rank: 2, name: 'David Levy', xp: 7350, avatar: 'D', icon: Medal, color: 'from-slate-400 to-slate-600' },
    { rank: 3, name: 'Rachel Klein', xp: 6890, avatar: 'R', icon: Medal, color: 'from-amber-700 to-amber-900' },
    { rank: 4, name: 'Moshe Ben', xp: 5240, avatar: 'M', icon: Trophy, color: 'from-blue-500 to-blue-600' },
    { rank: 5, name: 'Esther Gold', xp: 4980, avatar: 'E', icon: Trophy, color: 'from-purple-500 to-purple-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-600" />
          Top Learners This {timeframe}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topLearners.map((learner, idx) => {
          const Icon = learner.icon;
          return (
            <motion.div
              key={learner.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-xl ${
                learner.rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-white'
              } hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 bg-gradient-to-br ${learner.color} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                  {learner.rank <= 3 ? <Icon className="w-5 h-5" /> : learner.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-900 truncate">{learner.name}</div>
                  <div className="text-sm text-slate-600">{learner.xp.toLocaleString()} XP</div>
                </div>
              </div>
              <div className="text-2xl font-black text-slate-400">
                #{learner.rank}
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}