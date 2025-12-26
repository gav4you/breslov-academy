import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SmartSuggestions() {
  const suggestions = [
    { text: 'Based on your progress, try "Advanced Kabbalah"', type: 'course' },
    { text: 'Join the daily Daf Yomi group', type: 'community' },
    { text: 'Review Hebrew vocabulary before next lesson', type: 'practice' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          Suggestions for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <p className="flex-1 text-sm text-slate-700 font-medium">{suggestion.text}</p>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}