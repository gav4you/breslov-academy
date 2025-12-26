import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ReviewScheduler() {
  const reviews = [
    { topic: 'Breslov Philosophy', dueIn: 'Due today', priority: 'high' },
    { topic: 'Talmud Berachot 5a', dueIn: 'Due tomorrow', priority: 'medium' },
    { topic: 'Hebrew Vocabulary', dueIn: 'Due in 3 days', priority: 'low' },
  ];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-blue-600" />
          Spaced Repetition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((review, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-bold text-slate-900">{review.topic}</h4>
              <Badge className={priorityColors[review.priority]}>
                {review.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4" />
              <span>{review.dueIn}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}