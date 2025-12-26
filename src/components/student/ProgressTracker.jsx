import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressTracker({ userProgress, course }) {
  const totalLessons = course?.lesson_count || 0;
  const completedLessons = userProgress?.filter(p => p.completed).length || 0;
  const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  const timeSpent = userProgress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0;
  const avgScore = userProgress?.filter(p => p.quiz_score)
    .reduce((sum, p, _, arr) => sum + p.quiz_score / arr.length, 0) || 0;

  return (
    <div className="space-y-4">
      <Card className="glass-effect border-0 premium-shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Overall Progress</h3>
            <Badge className="bg-blue-100 text-blue-800">
              {completedLessons}/{totalLessons} Complete
            </Badge>
          </div>
          <Progress value={percentage} className="h-3 mb-2" />
          <div className="text-right text-sm text-slate-600">{percentage.toFixed(0)}%</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="glass-effect border-0 premium-shadow rounded-xl">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{completedLessons}</div>
              <div className="text-xs text-slate-600">Completed</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="glass-effect border-0 premium-shadow rounded-xl">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{timeSpent}</div>
              <div className="text-xs text-slate-600">Minutes</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="glass-effect border-0 premium-shadow rounded-xl">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{avgScore.toFixed(0)}%</div>
              <div className="text-xs text-slate-600">Avg Score</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}