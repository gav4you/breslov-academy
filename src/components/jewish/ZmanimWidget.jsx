import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sunrise, Sunset, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ZmanimWidget() {
  const times = [
    { name: 'Shacharit', time: '7:00 AM', icon: Sunrise, color: 'text-orange-600' },
    { name: 'Mincha', time: '4:00 PM', icon: Clock, color: 'text-blue-600' },
    { name: 'Maariv', time: '7:30 PM', icon: Sunset, color: 'text-indigo-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-2xl">
      <CardContent className="p-4">
        <div className="space-y-2">
          {times.map((time, idx) => {
            const Icon = time.icon;
            return (
              <motion.div
                key={time.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-2 bg-white/50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${time.color}`} />
                  <span className="font-medium text-slate-700 text-sm">{time.name}</span>
                </div>
                <span className="font-bold text-slate-900 text-sm">{time.time}</span>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}