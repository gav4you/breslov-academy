import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Clock, Award, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Challenges() {
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

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.list('-created_date')
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ['user-challenges', user?.email],
    queryFn: () => base44.entities.UserQuest.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const acceptChallengeMutation = useMutation({
    mutationFn: (challengeId) => base44.entities.UserQuest.create({
      user_email: user.email,
      quest_type: 'challenge',
      quest_id: challengeId,
      progress: 0,
      status: 'in_progress'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-challenges']);
    }
  });

  const isAccepted = (challengeId) => {
    return userChallenges.some(uc => uc.quest_id === challengeId);
  };

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900">Challenges</h1>
              <p className="text-xl text-slate-600">Complete challenges to earn rewards</p>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((challenge, idx) => {
            const accepted = isAccepted(challenge.id);
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem] overflow-hidden h-full">
                  <div className="h-3 bg-gradient-to-r from-orange-500 to-red-600" />
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-slate-900 mb-2">
                          {challenge.title}
                        </h3>
                        <p className="text-slate-600">{challenge.description}</p>
                      </div>
                      <Trophy className="w-8 h-8 text-amber-500" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {challenge.reward_points} XP
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {challenge.duration_days} days
                      </Badge>
                      {challenge.difficulty && (
                        <Badge className={
                          challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {challenge.difficulty}
                        </Badge>
                      )}
                    </div>

                    <div className="pt-4">
                      {accepted ? (
                        <div className="flex items-center justify-center gap-2 p-3 bg-green-50 rounded-xl text-green-700 font-bold">
                          <CheckCircle className="w-5 h-5" />
                          Challenge Accepted
                        </div>
                      ) : (
                        <Button
                          onClick={() => acceptChallengeMutation.mutate(challenge.id)}
                          disabled={acceptChallengeMutation.isPending}
                          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl py-6"
                        >
                          Accept Challenge
                        </Button>
                      )}
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