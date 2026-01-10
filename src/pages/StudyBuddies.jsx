import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Check, X, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { tokens, cx } from '@/components/theme/tokens';
import GamificationLayout from '@/components/gamification/GamificationLayout';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function StudyBuddies() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: buddies = [], isLoading } = useQuery({
    queryKey: ['study-buddies', user?.email],
    queryFn: async () => {
      const b1 = await base44.entities.StudyBuddy.filter({ user1_email: user.email });
      const b2 = await base44.entities.StudyBuddy.filter({ user2_email: user.email });
      return [...b1, ...b2];
    },
    enabled: !!user?.email
  });

  const acceptMutation = useMutation({
    mutationFn: (buddy) => base44.entities.StudyBuddy.update(buddy.id, { status: 'active' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['study-buddies']);
      toast.success('Study buddy accepted!');
    }
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <GamificationLayout
      title="Study Buddies"
      subtitle="Connect with peers for accountability, shared learning, and motivation."
    >
      <div className={cx("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", tokens.layout.gridGap)}>
        
        {/* Active & Pending Buddies */}
        {buddies.map((buddy) => {
          const partnerEmail = buddy.user1_email === user?.email ? buddy.user2_email : buddy.user1_email;
          const isPending = buddy.status === 'pending';
          const isIncoming = isPending && buddy.user2_email === user?.email;

          return (
            <div key={buddy.id} className={cx(tokens.glass.card, tokens.glass.cardHover, "overflow-hidden flex flex-col")}>
              {/* Card Header */}
              <div className="p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                    {partnerEmail[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground truncate max-w-[120px]">{partnerEmail}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cx(
                        "w-2 h-2 rounded-full",
                        buddy.status === 'active' ? "bg-green-500 animate-pulse" : "bg-amber-500"
                      )} />
                      <span className="text-xs text-muted-foreground capitalize">{buddy.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{buddy.match_score || 85}%</div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Match</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <span className="block text-lg font-bold text-foreground">{buddy.total_sessions || 0}</span>
                    <span className="text-xs text-muted-foreground">Sessions</span>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                    <span className="block text-lg font-bold text-foreground">2d</span>
                    <span className="text-xs text-muted-foreground">Streak</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground italic text-center">
                  "Let's review the morning lesson together!"
                </p>
              </div>

              {/* Card Footer */}
              <div className="p-4 bg-muted/20 border-t border-border/50">
                {isIncoming ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => acceptMutation.mutate(buddy)} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="default" className="flex-1" size="sm">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Find New Buddy CTA */}
        <div className={cx(tokens.glass.card, "border-2 border-dashed border-border/60 hover:border-primary/50 transition-colors flex flex-col items-center justify-center p-8 text-center min-h-[300px]")}>
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Find a Study Buddy</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            We'll match you with someone who shares your learning interests and schedule.
          </p>
          <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
            Start Matching
          </Button>
        </div>

      </div>
    </GamificationLayout>
  );
}