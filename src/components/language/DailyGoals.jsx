import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Flame, Trophy, BookOpen, Volume2, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DailyGoals({ progress }) {
  const goals = [
    {
      icon: BookOpen,
      label: 'Learn 20 new words',
      current: progress?.vocabulary_mastered?.length || 0,
      target: 20,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Volume2,
      label: 'Complete 5 lessons',
      current: progress?.units_completed?.length || 0,
      target: 5,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: PenTool,
      label: '15 minutes practice',
      current: progress?.total_minutes_studied || 0,
      target: 15,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const totalProgress = goals.reduce((sum, goal) => sum + Math.min(100, (goal.current / goal.target) * 100), 0) / goals.length;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            Daily Goals
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge className="bg-orange-100 text-orange-800 flex items-center gap-2">
              <Flame className="w-4 h-4" />
              {progress?.daily_streak || 0} day streak
            </Badge>
            {totalProgress === 100 && (
              <Badge className="bg-amber-100 text-amber-800 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Complete!
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-bold text-slate-700">
            <span>Today's Progress</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <Progress value={totalProgress} className="h-4" />
        </div>

        {/* Individual Goals */}
        <div className="space-y-4">
          {goals.map((goal, idx) => {
            const Icon = goal.icon;
            const progress = Math.min(100, (goal.current / goal.target) * 100);
            const isComplete = progress === 100;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  isComplete ? 'bg-green-50 border-green-500' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl ${goal.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${goal.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{goal.label}</div>
                    <div className="text-sm text-slate-600">
                      {goal.current} / {goal.target}
                      {isComplete && <span className="ml-2 text-green-600">✓ Complete!</span>}
                    </div>
                  </div>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}