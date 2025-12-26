import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BookOpen, Trophy, Star, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecentActivity() {
  const activities = [
    { type: 'course_completed', text: 'Completed "Breslov Philosophy 101"', time: '2 hours ago', icon: Trophy, color: 'text-amber-600' },
    { type: 'lesson_viewed', text: 'Watched "Hitbodedut Practice"', time: '5 hours ago', icon: BookOpen, color: 'text-blue-600' },
    { type: 'achievement', text: 'Earned "7-Day Streak" badge', time: '1 day ago', icon: Star, color: 'text-purple-600' },
    { type: 'quiz_passed', text: 'Scored 95% on Talmud Quiz', time: '2 days ago', icon: CheckCircle, color: 'text-green-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, idx) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 text-sm">{activity.text}</p>
                <p className="text-xs text-slate-500">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}