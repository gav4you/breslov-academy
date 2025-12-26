import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function OmerCounter() {
  const [omerDay, setOmerDay] = useState(0);
  const [isOmerPeriod, setIsOmerPeriod] = useState(false);

  useEffect(() => {
    // In production, calculate based on Hebrew calendar
    // Omer is counted from Pesach to Shavuot (49 days)
    const checkOmer = () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      
      // Sample: April-May period
      const isInPeriod = (month === 3 && day >= 15) || (month === 4 && day <= 25);
      setIsOmerPeriod(isInPeriod);
      
      if (isInPeriod) {
        const dayOfOmer = month === 3 ? day - 14 : day + 17;
        setOmerDay(Math.min(dayOfOmer, 49));
      }
    };

    checkOmer();
  }, []);

  if (!isOmerPeriod) return null;

  const weeks = Math.floor(omerDay / 7);
  const days = omerDay % 7;
  const progressPercent = (omerDay / 49) * 100;

  const sefirot = [
    'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malchut'
  ];
  const sefirotHebrew = [
    'חסד', 'גבורה', 'תפארת', 'נצח', 'הוד', 'יסוד', 'מלכות'
  ];

  const currentSefirah = sefirot[weeks % 7];
  const currentSefirahHebrew = sefirotHebrew[weeks % 7];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <div>
            <div>Sefirat HaOmer</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ספירת העומר</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl text-white text-center">
          <div className="text-sm opacity-80 mb-2">Today is</div>
          <div className="text-5xl font-black mb-2">{omerDay}</div>
          <div className="text-xl mb-4">
            {weeks > 0 && `${weeks} week${weeks !== 1 ? 's' : ''} and `}
            {days} day{days !== 1 ? 's' : ''}
          </div>
          <div className="text-3xl text-purple-300 font-serif" dir="rtl">
            יום {omerDay} לעומר
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-slate-700">Journey to Shavuot</span>
            <span className="text-slate-600">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <div className="text-xs text-slate-600 mt-2 text-center">
            {49 - omerDay} days until Shavuot
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm font-bold text-purple-900 mb-2">
            Today's Sefirah
          </div>
          <div className="text-2xl font-black text-slate-900">{currentSefirah}</div>
          <div className="text-xl text-purple-700 font-serif" dir="rtl">{currentSefirahHebrew}</div>
          <div className="text-sm text-slate-700 mt-3">
            Focus today on cultivating {currentSefirah.toLowerCase()} in your spiritual growth
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {sefirot.map((sefirah, idx) => (
            <div
              key={idx}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold ${
                idx < weeks 
                  ? 'bg-purple-600 text-white' 
                  : idx === weeks
                  ? 'bg-purple-300 text-purple-900'
                  : 'bg-slate-200 text-slate-400'
              }`}
              title={sefirah}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}