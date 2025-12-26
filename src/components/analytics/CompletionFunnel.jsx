import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompletionFunnel() {
  const stages = [
    { stage: 'Started Course', count: 1000, percentage: 100 },
    { stage: 'Completed 25%', count: 850, percentage: 85 },
    { stage: 'Completed 50%', count: 650, percentage: 65 },
    { stage: 'Completed 75%', count: 450, percentage: 45 },
    { stage: 'Completed 100%', count: 320, percentage: 32 },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-indigo-600" />
          Completion Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stages.map((stage, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            className="space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{stage.stage}</span>
              <span className="font-bold text-slate-900">{stage.count}</span>
            </div>
            <div className="h-8 bg-slate-200 rounded-xl overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stage.percentage}%` }}
                transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-end pr-3"
              >
                <span className="text-xs font-bold text-white">{stage.percentage}%</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}