import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MonthlyInsights() {
  const insights = [
    { 
      title: 'Most Active Day',
      value: 'Wednesday',
      detail: '4.2 hours avg',
      icon: BarChart3,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Top Subject',
      value: 'Talmud',
      detail: '45% of time',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Best Score',
      value: '98%',
      detail: 'Halacha Quiz',
      icon: Award,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Fastest Learning',
      value: 'Morning',
      detail: '7-9 AM peak',
      icon: Zap,
      color: 'from-amber-500 to-amber-600'
    },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Monthly Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white rounded-xl shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm text-slate-600">{insight.title}</div>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">{insight.value}</div>
                <div className="text-xs text-slate-600">{insight.detail}</div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}