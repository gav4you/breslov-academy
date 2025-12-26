import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Sparkles } from 'lucide-react';

export default function YomTovIndicator() {
  const [holiday, setHoliday] = useState(null);

  useEffect(() => {
    // In production, use Hebrew calendar API
    const holidays = [
      { name: 'Rosh Hashanah', nameHebrew: 'ראש השנה', icon: '🍎', color: 'from-red-500 to-orange-600' },
      { name: 'Yom Kippur', nameHebrew: 'יום כיפור', icon: '🕊️', color: 'from-blue-500 to-indigo-600' },
      { name: 'Sukkot', nameHebrew: 'סוכות', icon: '🌿', color: 'from-green-500 to-emerald-600' },
      { name: 'Chanukah', nameHebrew: 'חנוכה', icon: '🕎', color: 'from-blue-400 to-purple-500' },
      { name: 'Purim', nameHebrew: 'פורים', icon: '🎭', color: 'from-purple-500 to-pink-600' },
      { name: 'Pesach', nameHebrew: 'פסח', icon: '🍷', color: 'from-amber-500 to-red-600' },
      { name: 'Shavuot', nameHebrew: 'שבועות', icon: '📜', color: 'from-blue-500 to-cyan-600' }
    ];

    // Sample - set Chanukah as current
    setHoliday(holidays[3]);
  }, []);

  if (!holiday) return null;

  return (
    <div className="fixed top-20 left-4 z-50">
      <Card className={`bg-gradient-to-br ${holiday.color} border-2 border-white/30 shadow-2xl`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{holiday.icon}</div>
            <div>
              <div className="font-black text-white text-lg">{holiday.name}</div>
              <div className="text-white/90 font-serif" dir="rtl">{holiday.nameHebrew}</div>
            </div>
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}