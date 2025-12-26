import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeaderboardWidget({ period = 'week' }) {
  const leaderboard = [
    { rank: 1, name: 'Moshe Cohen', xp: 3450, lessons: 24, streak: 18, level: 'Sage', isMe: false },
    { rank: 2, name: 'David Levy', xp: 3120, lessons: 22, streak: 15, level: 'Scholar', isMe: false },
    { rank: 3, name: 'You', xp: 2890, lessons: 19, streak: 12, level: 'Scholar', isMe: true },
    { rank: 4, name: 'Yosef Katz', xp: 2650, lessons: 18, streak: 14, level: 'Student', isMe: false },
    { rank: 5, name: 'Sarah M.', xp: 2340, lessons: 16, streak: 11, level: 'Student', isMe: false }
  ];

  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: Crown, color: 'text-amber-500' };
    if (rank === 2) return { icon: Medal, color: 'text-slate-400' };
    if (rank === 3) return { icon: Medal, color: 'text-orange-600' };
    return { icon: Award, color: 'text-slate-500' };
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <div>Leaderboard</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">טבלת מובילים</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">This Week</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {leaderboard.map((entry, idx) => {
          const { icon: RankIcon, color } = getRankIcon(entry.rank);
          
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                entry.isMe 
                  ? 'bg-blue-50 border-blue-300 shadow-lg' 
                  : entry.rank <= 3
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <RankIcon className={`w-6 h-6 ${color}`} />
                  <div className={`text-2xl font-black ${entry.rank <= 3 ? color : 'text-slate-600'}`}>
                    #{entry.rank}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="font-bold text-slate-900">
                    {entry.name}
                    {entry.isMe && (
                      <Badge className="bg-blue-600 text-white text-xs ml-2">You</Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600">{entry.level}</div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">{entry.xp}</div>
                  <div className="text-xs text-slate-600">XP</div>
                </div>
              </div>

              <div className="flex gap-4 mt-3 text-xs text-slate-600">
                <div>{entry.lessons} lessons</div>
                <div>•</div>
                <div>{entry.streak} day streak</div>
              </div>
            </motion.div>
          );
        })}

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 text-center">
          <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <div className="text-sm text-purple-900 font-serif">
            Complete 3 more lessons to reach #2!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}