import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SefiratHaOmer({ currentDay = 1 }) {
  const sefirotCombinations = [
    { day: 1, week: 'Chesed', day_attr: 'Chesed', hebrewWeek: 'חסד', hebrewDay: 'חסד' },
    { day: 2, week: 'Chesed', day_attr: 'Gevurah', hebrewWeek: 'חסד', hebrewDay: 'גבורה' },
    { day: 3, week: 'Chesed', day_attr: 'Tiferet', hebrewWeek: 'חסד', hebrewDay: 'תפארת' },
    { day: 8, week: 'Gevurah', day_attr: 'Chesed', hebrewWeek: 'גבורה', hebrewDay: 'חסד' },
    { day: 15, week: 'Tiferet', day_attr: 'Chesed', hebrewWeek: 'תפארת', hebrewDay: 'חסד' }
  ];

  const todaySefirah = sefirotCombinations.find(s => s.day === currentDay) || sefirotCombinations[0];

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl text-white">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-6 h-6 text-purple-300" />
        <div>
          <div className="text-sm opacity-80">Sefirat HaOmer</div>
          <div className="text-2xl font-black">Day {currentDay}</div>
        </div>
      </div>

      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-4">
        <div className="text-sm opacity-80 mb-2">Today's Sefirah</div>
        <div className="text-3xl font-black mb-1">
          {todaySefirah.day_attr} within {todaySefirah.week}
        </div>
        <div className="text-xl text-purple-300 font-serif" dir="rtl">
          {todaySefirah.hebrewDay} שב{todaySefirah.hebrewWeek}
        </div>
      </div>

      <div className="text-sm text-white/80 mb-4">
        Focus today on combining {todaySefirah.day_attr.toLowerCase()} (kindness/strength/beauty) with {todaySefirah.week.toLowerCase()}
      </div>

      <Button className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl">
        <CheckCircle className="w-4 h-4 mr-2" />
        Mark Today's Count
      </Button>
    </div>
  );
}