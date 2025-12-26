import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyChallenge() {
  const challenge = {
    title: 'Torah Speed Round',
    description: 'Complete 3 quizzes in under 10 minutes',
    reward: 500,
    progress: 1,
    total: 3,
    timeLeft: '18h 32m',
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-orange-600" />
          Daily Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{challenge.title}</h3>
          <p className="text-slate-600">{challenge.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-bold text-slate-900">{challenge.progress} / {challenge.total}</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-600"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-slate-900">+{challenge.reward} XP</span>
          </div>
          <span className="text-sm text-slate-600">{challenge.timeLeft} left</span>
        </div>

        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl btn-premium">
          Continue Challenge
        </Button>
      </CardContent>
    </Card>
  );
}