import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HalachaDaily() {
  const dailyHalacha = {
    category: 'Shabbat',
    question: 'Can one use a timer to turn on lights on Shabbat?',
    ruling: 'It is permissible to use a timer set before Shabbat to turn lights on during Shabbat.',
    source: 'Shulchan Aruch, Orach Chaim 252:5',
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-purple-600" />
          Halacha of the Day
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Badge className="bg-purple-100 text-purple-800 mb-3">
            {dailyHalacha.category}
          </Badge>
          <h3 className="text-xl font-bold text-slate-900 mb-3">
            {dailyHalacha.question}
          </h3>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl mb-3">
            <p className="text-slate-700 leading-relaxed">{dailyHalacha.ruling}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">{dailyHalacha.source}</span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}