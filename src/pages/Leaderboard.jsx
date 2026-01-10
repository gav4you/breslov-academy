import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, Award, Flame, Target, ChevronUp, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { tokens, cx } from '@/components/theme/tokens';
import GamificationLayout from '@/components/gamification/GamificationLayout';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function Leaderboard() {
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

  const { data: leaders = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.Leaderboard.list('-total_points', 50)
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-amber-500 fill-amber-500/20" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-400 fill-slate-400/20" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700 fill-amber-700/20" />;
    return <span className="font-bold text-muted-foreground w-6 text-center">{rank}</span>;
  };

  return (
    <GamificationLayout 
      title="Global Leaderboard" 
      subtitle="Compete with students worldwide and climb the ranks through dedication and consistency."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Rankings */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="global" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className={tokens.text.h2}>Top Scholars</h2>
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="global">All Time</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="global" className="space-y-3 mt-0">
              {leaders.map((leader, idx) => {
                const isMe = leader.user_email === user?.email;
                return (
                  <div 
                    key={leader.id} 
                    className={cx(
                      tokens.glass.card, 
                      "p-4 flex items-center gap-4 transition-all hover:scale-[1.01]",
                      isMe ? "ring-2 ring-primary bg-primary/5" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-muted/50 rounded-xl font-serif text-lg">
                      {getRankIcon(idx + 1)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground truncate">{leader.user_name}</h3>
                        {isMe && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">You</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {leader.courses_completed} courses
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {leader.streak_days} day streak
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-primary tabular-nums">
                        {leader.total_points?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Points</p>
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className={cx(tokens.glass.card, "p-6")}>
            <h3 className={cx(tokens.text.h3, "mb-4")}>Your Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Current Rank</span>
                <span className="font-bold text-foreground">#42</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Weekly Change</span>
                <span className="flex items-center text-green-600 font-medium">
                  <ChevronUp className="w-4 h-4 mr-1" />
                  +5
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Next Tier</span>
                <span className="text-amber-600 font-medium">Elite Scholar</span>
              </div>
            </div>
          </div>

          <div className={cx(tokens.glass.card, "p-6 bg-gradient-to-br from-primary/5 to-transparent")}>
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500/20" />
              <h3 className={tokens.text.h3}>Daily Streak</h3>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">12 Days</p>
            <p className="text-sm text-muted-foreground mb-4">
              Keep it up! 3 more days to reach a 15-day milestone badge.
            </p>
            <div className="flex gap-1 h-2">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i} 
                  className={cx(
                    "flex-1 rounded-full",
                    i < 5 ? "bg-orange-500" : "bg-muted"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>

      </div>
    </GamificationLayout>
  );
}