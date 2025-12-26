import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, Star, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function BadgeCollection({ earnedBadges = [] }) {
  const allBadges = [
    {
      id: 'first_lesson',
      name: 'First Steps',
      nameHebrew: 'צעדים ראשונים',
      description: 'Complete your first lesson',
      icon: '🎯',
      rarity: 'common',
      earned: true
    },
    {
      id: 'week_streak',
      name: 'Weekly Warrior',
      nameHebrew: 'לוחם שבועי',
      description: '7-day learning streak',
      icon: '🔥',
      rarity: 'uncommon',
      earned: true
    },
    {
      id: 'perfect_score',
      name: 'Perfect Scholar',
      nameHebrew: 'תלמיד מושלם',
      description: 'Score 100% on a quiz',
      icon: '💯',
      rarity: 'rare',
      earned: false,
      progress: 92
    },
    {
      id: 'month_streak',
      name: 'Monthly Master',
      nameHebrew: 'אדון החודש',
      description: '30-day learning streak',
      icon: '🏆',
      rarity: 'epic',
      earned: false,
      progress: 18,
      total: 30
    },
    {
      id: 'complete_course',
      name: 'Course Completer',
      nameHebrew: 'משלים קורס',
      description: 'Finish an entire course',
      icon: '📚',
      rarity: 'rare',
      earned: true
    },
    {
      id: 'midnight_scholar',
      name: 'Chatzot Scholar',
      nameHebrew: 'למדן חצות',
      description: 'Study at midnight 10 times',
      icon: '🌙',
      rarity: 'epic',
      earned: false,
      progress: 3,
      total: 10
    },
    {
      id: 'master_hebrew',
      name: 'Hebrew Master',
      nameHebrew: 'מאסטר עברית',
      description: 'Master 500 Hebrew words',
      icon: '🇮🇱',
      rarity: 'legendary',
      earned: false,
      progress: 156,
      total: 500
    },
    {
      id: 'chavruta_champ',
      name: 'Chavruta Champion',
      nameHebrew: 'אלוף חברותא',
      description: '100 AI study sessions',
      icon: '👥',
      rarity: 'epic',
      earned: false,
      progress: 43,
      total: 100
    }
  ];

  const rarityColors = {
    common: 'from-slate-400 to-slate-500',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-orange-600'
  };

  const earnedCount = allBadges.filter(b => b.earned).length;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <Trophy className="w-5 h-5 text-amber-600" />
            <div>
              <div>Badge Collection</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">אוסף תגים</div>
            </div>
          </div>
          <Badge className="bg-amber-100 text-amber-800">
            {earnedCount} / {allBadges.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-slate-900">Collection Progress</span>
            <span className="text-slate-600">{Math.round((earnedCount / allBadges.length) * 100)}%</span>
          </div>
          <Progress value={(earnedCount / allBadges.length) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {allBadges.map((badge, idx) => {
            const isLocked = !badge.earned;
            const hasProgress = badge.progress !== undefined;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                className={`relative p-4 rounded-2xl border-2 transition-all ${
                  isLocked 
                    ? 'bg-slate-50 border-slate-200 opacity-60' 
                    : `bg-gradient-to-br ${rarityColors[badge.rarity]} border-white/40`
                }`}
              >
                {isLocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                )}
                
                <div className={`text-5xl mb-2 ${isLocked ? 'grayscale' : ''}`}>
                  {badge.icon}
                </div>
                
                <div className={`font-bold text-sm mb-1 ${isLocked ? 'text-slate-600' : 'text-white'}`}>
                  {badge.name}
                </div>
                <div className={`text-xs ${isLocked ? 'text-slate-500' : 'text-white/80'}`} dir="rtl">
                  {badge.nameHebrew}
                </div>
                
                {hasProgress && isLocked && (
                  <div className="mt-3 space-y-1">
                    <Progress value={(badge.progress / badge.total) * 100} className="h-1" />
                    <div className="text-xs text-slate-600 text-center">
                      {badge.progress} / {badge.total}
                    </div>
                  </div>
                )}

                {!isLocked && (
                  <div className="mt-2">
                    <Badge className={`bg-white/20 text-white text-xs border-white/30 capitalize`}>
                      {badge.rarity}
                    </Badge>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="font-bold text-purple-900 mb-2 font-serif">🎯 Next Milestone</div>
          <div className="text-sm text-purple-800">
            Earn 3 more badges to unlock the "Dedicated Scholar" title and exclusive Torah content!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}