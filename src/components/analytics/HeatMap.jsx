import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeatMap() {
  const generateDays = () => {
    const days = [];
    for (let week = 0; week < 12; week++) {
      for (let day = 0; day < 7; day++) {
        days.push({
          week,
          day,
          activity: Math.floor(Math.random() * 5)
        });
      }
    }
    return days;
  };

  const days = generateDays();

  const getColor = (activity) => {
    const colors = [
      'bg-slate-100',
      'bg-green-200',
      'bg-green-400',
      'bg-green-600',
      'bg-green-800'
    ];
    return colors[activity];
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Activity Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-1">
          {days.map((day, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.005 }}
              className={`w-3 h-3 rounded-sm ${getColor(day.activity)} hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all`}
              title={`Activity level: ${day.activity}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 text-xs text-slate-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-3 h-3 rounded-sm ${getColor(level)}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}