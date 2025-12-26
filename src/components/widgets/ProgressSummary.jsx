import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Award, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProgressSummary({ stats }) {
  const summaryItems = [
    { label: 'This Week', value: '+12h', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
    { label: 'Achievements', value: '3 new', icon: Award, color: 'from-purple-500 to-purple-600' },
    { label: 'Streak', value: '15 days', icon: Flame, color: 'from-orange-500 to-red-600' },
    { label: 'Goals Met', value: '4/5', icon: Target, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {summaryItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <Card className="glass-effect border-0 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl">
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xl font-black text-slate-900">{item.value}</div>
                <div className="text-xs text-slate-600">{item.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}