import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OmerCounter() {
  const omerDay = 15;
  const hebrewCount = 'יום חמישה עשר לעומר';
  const sefiraAttributes = {
    week: 'Chesed',
    day: 'Hod',
    full: 'Hod she\'b\'Chesed'
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Sefirat HaOmer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="space-y-2"
        >
          <div className="text-7xl font-black text-slate-900">{omerDay}</div>
          <div className="text-xl text-slate-600 font-bold" dir="rtl">{hebrewCount}</div>
        </motion.div>

        <div className="space-y-2">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2">
            {sefiraAttributes.full}
          </Badge>
          <div className="flex justify-center gap-2 text-sm text-slate-600">
            <span>Week: <span className="font-bold text-slate-900">{sefiraAttributes.week}</span></span>
            <span>•</span>
            <span>Day: <span className="font-bold text-slate-900">{sefiraAttributes.day}</span></span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(omerDay / 49) * 100}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
            />
          </div>
          <div className="text-xs text-slate-600 mt-2">{49 - omerDay} days until Shavuot</div>
        </div>
      </CardContent>
    </Card>
  );
}