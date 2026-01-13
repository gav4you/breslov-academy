import React from 'react';
import PageShell from '@/components/ui/PageShell';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, CheckCircle } from 'lucide-react';
import { BADGES, getRank, getNextRank, formatXP } from '@/components/gamification/gamificationEngine';

export default function Achievements() {
  const currentXP = 3450;
  const rank = getRank(currentXP);
  const nextRank = getNextRank(currentXP);

  // Mock user badges
  const earnedBadges = new Set(['daf-1', 'social-butterfly']);

  return (
    <PageShell title="Achievements" subtitle="Track your spiritual progression">
      
      {/* Rank Progress */}
      <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none">
        <CardContent className="pt-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Current Rank</div>
              <div className="text-3xl font-serif font-bold flex items-center gap-2">
                <span className="text-2xl">{rank.icon}</span> {rank.name}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">Next Rank: {nextRank?.name}</div>
              <div className="font-mono">{formatXP(currentXP)} / {formatXP(nextRank?.minXP || 0)} XP</div>
            </div>
          </div>
          <Progress value={nextRank?.progress || 100} className="h-3 bg-slate-700" indicatorClassName="bg-indigo-500" />
        </CardContent>
      </Card>

      {/* Badge Grid */}
      <h2 className="text-xl font-bold mb-4">Badges</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const isEarned = earnedBadges.has(badge.id);
          return (
            <Card key={badge.id} className={`relative overflow-hidden transition-all ${isEarned ? 'border-indigo-200 bg-indigo-50/30' : 'opacity-70 grayscale'}`}>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center mb-3
                  ${isEarned ? 'bg-white shadow-md' : 'bg-slate-100'}
                `}>
                  {isEarned ? (
                    <Trophy className={`w-8 h-8 ${
                      badge.tier === 'gold' ? 'text-yellow-500' : 
                      badge.tier === 'silver' ? 'text-slate-400' : 'text-orange-700'
                    }`} />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <h3 className="font-bold text-sm mb-1">{badge.label}</h3>
                <p className="text-xs text-slate-500">{badge.description}</p>
                {isEarned && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}