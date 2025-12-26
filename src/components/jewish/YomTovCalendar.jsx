import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function YomTovCalendar() {
  const holidays = [
    { name: 'Chanukah', hebrew: 'חנוכה', date: 'Dec 25 - Jan 2', days: 8, color: 'from-blue-500 to-blue-600' },
    { name: 'Tu B\'Shevat', hebrew: 'ט״ו בשבט', date: 'Feb 13', days: 1, color: 'from-green-500 to-green-600' },
    { name: 'Purim', hebrew: 'פורים', date: 'Mar 14', days: 1, color: 'from-purple-500 to-purple-600' },
    { name: 'Pesach', hebrew: 'פסח', date: 'Apr 13-21', days: 8, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-600" />
          Upcoming Holidays
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holidays.map((holiday, idx) => (
          <motion.div
            key={holiday.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-black text-slate-900">{holiday.name}</h4>
                <p className="text-xl text-amber-700 font-bold" dir="rtl">{holiday.hebrew}</p>
              </div>
              <Badge className={`bg-gradient-to-r ${holiday.color} text-white`}>
                {holiday.days} {holiday.days === 1 ? 'day' : 'days'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{holiday.date}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}