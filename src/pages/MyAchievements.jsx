import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Target, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MyAchievements() {
  const [user, setUser] = useState(null);

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

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['badges', user?.email],
    queryFn: () => base44.entities.Badge.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const iconMap = {
    trophy: Trophy,
    star: Star,
    target: Target,
    zap: Zap,
    crown: Crown,
    award: Award
  };

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black text-slate-900 mb-2">My Achievements</h1>
          <p className="text-xl text-slate-600">Your progress and accomplishments</p>
        </motion.div>

        {/* Badges */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Badges Earned</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((badge, idx) => {
              const Icon = iconMap[badge.icon_name] || Award;
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
                    <CardContent className="p-4 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${
                        badge.rarity === 'legendary' ? 'from-amber-400 to-amber-600' :
                        badge.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
                        badge.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
                        'from-slate-400 to-slate-600'
                      } rounded-2xl flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="font-bold text-slate-900 text-sm">{badge.name}</div>
                      <Badge className="mt-2 text-xs">
                        {badge.rarity}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-xl text-slate-900">{achievement.title}</h3>
                        <p className="text-slate-600">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-blue-600">
                          +{achievement.points_awarded} XP
                        </div>
                        <div className="text-xs text-slate-600">
                          {new Date(achievement.earned_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}