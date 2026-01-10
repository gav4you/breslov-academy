import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Star, Target, Flame, Lock } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';
import GamificationLayout from '@/components/gamification/GamificationLayout';
import AchievementBadge from '@/components/gamification/AchievementBadge';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function Achievements() {
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

  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }, '-earned_date'),
    enabled: !!user?.email
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const totalPoints = achievements.reduce((sum, a) => sum + (a.points || 0), 0);

  const allBadges = [
    { type: 'first_lesson', name: 'First Steps', description: 'Complete your first lesson', points: 10 },
    { type: 'first_course', name: 'Course Complete', description: 'Finish your first course', points: 50 },
    { type: 'streak_7', name: '7-Day Streak', description: 'Study for 7 days in a row', points: 30 },
    { type: 'streak_30', name: '30-Day Streak', description: 'Study for 30 days in a row', points: 100 },
    { type: 'streak_100', name: '100-Day Streak', description: 'Study for 100 days in a row', points: 500 },
    { type: 'complete_5_courses', name: 'Dedicated Scholar', description: 'Complete 5 courses', points: 200 },
    { type: 'complete_10_courses', name: 'Master Student', description: 'Complete 10 courses', points: 500 },
    { type: 'quiz_master', name: 'Quiz Master', description: 'Pass 10 quizzes with 100%', points: 150 },
    { type: 'perfect_score', name: 'Perfect Score', description: 'Get 100% on any quiz', points: 25 },
    { type: 'discussion_contributor', name: 'Discussion Leader', description: 'Post 20 discussions', points: 75 },
    { type: 'community_helper', name: 'Community Helper', description: 'Help others in 50 replies', points: 100 },
    { type: 'early_bird', name: 'Early Bird', description: 'Study before 6 AM', points: 20 },
    { type: 'night_owl', name: 'Night Owl', description: 'Study after 10 PM', points: 20 }
  ];

  const earnedTypes = achievements.map(a => a.badge_type);
  const locked = allBadges.filter(b => !earnedTypes.includes(b.type));

  return (
    <GamificationLayout
      title="Achievements"
      subtitle="Track your milestones and collect badges as you master new topics."
    >
      <div className="space-y-12">
        {/* Stats Grid */}
        <div className={cx("grid grid-cols-1 md:grid-cols-4", tokens.layout.gridGap)}>
          {[
            { label: 'Badges Earned', value: achievements.length, icon: Trophy, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
            { label: 'Total Points', value: totalPoints, icon: Star, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
            { label: 'Completion', value: `${Math.round((achievements.length / allBadges.length) * 100)}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
            { label: 'Current Streak', value: '7 Days', icon: Flame, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/20' }
          ].map((stat, i) => (
            <div key={i} className={cx(tokens.glass.card, "p-6 flex items-center gap-4")}>
              <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cx("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Earned Badges */}
        <div>
          <h2 className={cx(tokens.text.h2, "mb-6 border-b border-border/50 pb-2")}>Collection</h2>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="group relative">
                  <div className={cx(tokens.glass.card, tokens.glass.cardHover, "p-6 flex flex-col items-center text-center h-full")}>
                    <div className="transform group-hover:scale-110 transition-transform duration-300">
                      <AchievementBadge achievement={achievement} size="lg" />
                    </div>
                    <h3 className="font-bold text-sm mt-4 mb-1">{achievement.badge_name || achievement.badge_type}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.earned_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No badges earned yet. Start learning to unlock your first one!</p>
            </div>
          )}
        </div>

        {/* Locked Badges */}
        <div>
          <h2 className={cx(tokens.text.h2, "mb-6 border-b border-border/50 pb-2 opacity-75")}>
            Available ({locked.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 opacity-75">
            {locked.map((badge) => (
              <div key={badge.type} className={cx(tokens.glass.card, "p-6 flex flex-col items-center text-center h-full bg-muted/10")}>
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 ring-4 ring-background">
                  <Lock className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{badge.description}</p>
                <div className="mt-auto pt-2 border-t border-border/50 w-full">
                  <span className="text-xs font-bold text-primary">+{badge.points} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GamificationLayout>
  );
}