import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileBarChart, TrendingUp, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyReport() {
  const report = {
    hoursStudied: 12.5,
    lessonsCompleted: 8,
    quizzesPassed: 5,
    streakMaintained: true,
    weekGrowth: '+25%',
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileBarChart className="w-5 h-5 text-indigo-600" />
          Weekly Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center"
          >
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-black text-blue-900">{report.hoursStudied}h</div>
            <div className="text-xs text-blue-700">Studied</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center"
          >
            <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-3xl font-black text-green-900">{report.lessonsCompleted}</div>
            <div className="text-xs text-green-700">Lessons</div>
          </motion.div>
        </div>

        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">Growth This Week</span>
          </div>
          <div className="text-4xl font-black">{report.weekGrowth}</div>
        </div>

        {report.streakMaintained && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl text-center border-2 border-orange-200"
          >
            <span className="text-orange-900 font-bold">🔥 Streak maintained!</span>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}