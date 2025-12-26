import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown, TrendingUp, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const levels = await base44.entities.UserLevel.list('-experience_points', 100);
      return levels;
    }
  });

  const medals = [Trophy, Medal, Award];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl shadow-xl mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900">Leaderboard</h1>
          <p className="text-xl text-slate-600">Top students this month</p>
        </motion.div>

        <div className="flex justify-center gap-3 mb-8">
          {['all', 'week', 'month'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${
                timeframe === t
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:shadow-md'
              }`}
            >
              {t === 'all' ? 'All Time' : t === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {leaderboard.map((entry, idx) => {
            const Icon = medals[idx] || TrendingUp;
            const isCurrentUser = entry.user_email === user?.email;

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Card className={`glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl ${
                  isCurrentUser ? 'border-2 border-blue-500 bg-blue-50/50' : ''
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl ${
                        idx === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white' :
                        idx === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-800 text-white' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {idx < 3 ? <Icon className="w-8 h-8" /> : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-black text-xl text-slate-900">
                            {entry.user_email?.split('@')[0] || 'Student'}
                          </div>
                          {isCurrentUser && (
                            <Badge className="bg-blue-500 text-white">You</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className="bg-purple-100 text-purple-800">
                            Level {entry.current_level}
                          </Badge>
                          <span className="text-slate-600">
                            {entry.lessons_completed} lessons
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                          {entry.experience_points?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-slate-600">XP</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}