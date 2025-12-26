import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TimeSpentChart() {
  const categories = [
    { name: 'Talmud', hours: 24, color: 'from-blue-500 to-blue-600' },
    { name: 'Torah', hours: 18, color: 'from-green-500 to-green-600' },
    { name: 'Kabbalah', hours: 12, color: 'from-purple-500 to-purple-600' },
    { name: 'Halacha', hours: 8, color: 'from-amber-500 to-amber-600' },
  ];

  const maxHours = Math.max(...categories.map(c => c.hours));

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Time Spent by Category
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((category, idx) => {
          const percentage = (category.hours / maxHours) * 100;
          return (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-900">{category.name}</span>
                <span className="font-medium text-slate-600">{category.hours}h</span>
              </div>
              <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${category.color}`}
                />
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}