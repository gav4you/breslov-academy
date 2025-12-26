import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningHeatmap({ activityData = [] }) {
  const generateHeatmapData = () => {
    const weeks = [];
    const today = new Date();
    
    for (let week = 0; week < 12; week++) {
      const days = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (11 - week) * 7 - (6 - day));
        
        const activity = Math.floor(Math.random() * 5);
        days.push({
          date,
          activity,
          lessons: activity
        });
      }
      weeks.push(days);
    }
    
    return weeks;
  };

  const heatmapData = generateHeatmapData();

  const getColorClass = (activity) => {
    if (activity === 0) return 'bg-slate-100';
    if (activity === 1) return 'bg-green-200';
    if (activity === 2) return 'bg-green-400';
    if (activity === 3) return 'bg-green-600';
    return 'bg-green-800';
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <div>Learning Activity</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">פעילות לימודית</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {heatmapData.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((day, dayIdx) => (
                  <motion.div
                    key={dayIdx}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                    className={`w-4 h-4 rounded ${getColorClass(day.activity)} hover:ring-2 hover:ring-green-500 transition-all cursor-pointer`}
                    title={`${day.date.toLocaleDateString()}: ${day.lessons} lessons`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Less active</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(level => (
              <div key={level} className={`w-4 h-4 rounded ${getColorClass(level)}`} />
            ))}
          </div>
          <span>More active</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
            <div className="text-2xl font-black text-green-600">78</div>
            <div className="text-xs text-slate-600">Days Active</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <div className="text-2xl font-black text-blue-600">156</div>
            <div className="text-xs text-slate-600">Total Lessons</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <div className="text-2xl font-black text-purple-600">2.1</div>
            <div className="text-xs text-slate-600">Avg/Day</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}