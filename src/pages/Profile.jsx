import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Award, BookOpen, Flame, Edit, Share2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function Profile() {
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

  const { data: userLevel } = useQuery({
    queryKey: ['userLevel', user?.email],
    queryFn: async () => {
      const levels = await base44.entities.UserLevel.filter({ user_email: user.email });
      return levels[0] || { current_level: 'Initiate', experience_points: 0 };
    },
    enabled: !!user?.email
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const completedLessons = progress.filter(p => p.completed).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="glass-effect border-0 premium-shadow-xl rounded-[3rem] overflow-hidden">
        <div className="relative bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 p-12">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" className="text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          <div className="flex items-start gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <User className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1 text-white">
              <div className="text-5xl font-black mb-2">{user?.full_name}</div>
              <div className="text-xl text-blue-300 mb-4">{user?.email}</div>
              
              <div className="flex items-center gap-4">
                <Badge className="bg-purple-600 text-white px-4 py-2 text-lg">
                  {userLevel?.current_level || 'Initiate'}
                </Badge>
                <div className="text-white/80">
                  {userLevel?.experience_points || 0} XP
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <div className="text-4xl font-black text-slate-900 mb-2">{completedLessons}</div>
            <div className="text-slate-600">Lessons Completed</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <Award className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <div className="text-4xl font-black text-slate-900 mb-2">{achievements.length}</div>
            <div className="text-slate-600">Achievements</div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8 text-center">
            <Flame className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <div className="text-4xl font-black text-slate-900 mb-2">12</div>
            <div className="text-slate-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Recent Achievements</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement, idx) => (
              <div
                key={idx}
                className="p-4 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl text-white text-center"
              >
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="font-bold">{achievement.badge_name}</div>
                <div className="text-xs opacity-80">+{achievement.points} XP</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}