import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningStreak({ streakData }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mockData = streakData || [
    { day: 'Sun', completed: true },
    { day: 'Mon', completed: true },
    { day: 'Tue', completed: true },
    { day: 'Wed', completed: false },
    { day: 'Thu', completed: true },
    { day: 'Fri', completed: true },
    { day: 'Sat', completed: true },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-600" />
          This Week's Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {mockData.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${
                day.completed
                  ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-lg'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {day.completed && <Flame className="w-6 h-6" />}
              </div>
              <div className="text-xs font-medium text-slate-600">{day.day}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}