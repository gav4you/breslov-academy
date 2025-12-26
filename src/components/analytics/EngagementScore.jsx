import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EngagementScore({ score = 85 }) {
  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: 'from-green-500 to-emerald-600', text: 'Exceptional' };
    if (score >= 80) return { grade: 'A', color: 'from-blue-500 to-blue-600', text: 'Excellent' };
    if (score >= 70) return { grade: 'B', color: 'from-purple-500 to-purple-600', text: 'Good' };
    return { grade: 'C', color: 'from-orange-500 to-orange-600', text: 'Fair' };
  };

  const result = getGrade(score);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Engagement Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className={`w-24 h-24 bg-gradient-to-br ${result.color} rounded-2xl flex items-center justify-center shadow-xl`}
          >
            <span className="text-4xl font-black text-white">{result.grade}</span>
          </motion.div>
          <div className="flex-1">
            <div className="text-3xl font-black text-slate-900 mb-1">{score}%</div>
            <div className="text-lg text-slate-600 font-medium mb-2">{result.text}</div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Award className="w-4 h-4" />
              <span>+5% from last week</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}