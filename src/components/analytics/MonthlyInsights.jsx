import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Clock, BookOpen, Star, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonthlyInsights() {
  const insights = {
    totalHours: 42.5,
    coursesStarted: 3,
    coursesCompleted: 1,
    averageScore: 87,
    streakDays: 18,
    xpEarned: 3450,
    topCourse: 'Likutey Moharan',
    bestDay: 'Friday',
    improvementArea: 'Talmud comprehension',
    achievements: 5
  };

  const highlights = [
    {
      icon: Trophy,
      color: 'from-amber-500 to-yellow-600',
      label: 'Top Achievement',
      value: 'Scholar Level Reached',
      detail: '+500 XP bonus'
    },
    {
      icon: Clock,
      color: 'from-blue-500 to-indigo-600',
      label: 'Study Streak',
      value: `${insights.streakDays} Days`,
      detail: 'Personal record!'
    },
    {
      icon: BookOpen,
      color: 'from-green-500 to-emerald-600',
      label: 'Courses Completed',
      value: insights.coursesCompleted,
      detail: `${insights.coursesStarted} in progress`
    },
    {
      icon: Star,
      color: 'from-purple-500 to-pink-600',
      label: 'Average Score',
      value: `${insights.averageScore}%`,
      detail: '+5% from last month'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="font-serif">
            <div className="text-2xl">Monthly Report</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">דוח חודשי</div>
          </div>
          <Badge className="bg-blue-100 text-blue-800">
            December 2025
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-2xl border-2 border-slate-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs text-slate-600 mb-1">{item.label}</div>
                <div className="text-2xl font-black text-slate-900 mb-1">{item.value}</div>
                <div className="text-xs text-slate-600">{item.detail}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200">
          <div className="font-bold text-amber-900 mb-3 font-serif">✨ Key Insights</div>
          <div className="space-y-2 text-sm text-amber-900">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
              <div>Your most engaged day is <strong>{insights.bestDay}</strong> - schedule important lessons then</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
              <div>You excel in <strong>{insights.topCourse}</strong> with 92% average</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
              <div>Focus on <strong>{insights.improvementArea}</strong> for balanced growth</div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2" />
              <div>Morning study sessions show 23% better retention</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-bold text-blue-900 mb-1">Next Month's Goal</div>
              <div className="text-sm text-blue-800">
                Maintain your {insights.streakDays}-day streak and complete 2 more courses to reach Sage level!
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}