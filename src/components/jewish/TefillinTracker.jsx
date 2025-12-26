import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Award, Flame } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TefillinTracker() {
  const [logged, setLogged] = useState(false);
  const [streak, setStreak] = useState(12);

  const thisWeek = [
    { day: 'Sun', done: true },
    { day: 'Mon', done: true },
    { day: 'Tue', done: true },
    { day: 'Wed', done: true },
    { day: 'Thu', done: false },
    { day: 'Fri', done: false },
    { day: 'Sat', done: false }
  ];

  const logTefillin = () => {
    setLogged(true);
    setStreak(streak + 1);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Award className="w-5 h-5 text-blue-600" />
          <div>
            <div>Tefillin Tracker</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">מעקב תפילין</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-black text-slate-900">{streak} Days</div>
              <div className="text-sm text-slate-600">Current Streak</div>
            </div>
          </div>
          {!logged && (
            <Button
              onClick={logTefillin}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Log Today
            </Button>
          )}
          {logged && (
            <Badge className="bg-green-100 text-green-800">
              ✓ Logged
            </Badge>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          {thisWeek.map((day, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center p-2 rounded-lg ${
                day.done ? 'bg-green-100' : 'bg-slate-100'
              }`}
            >
              <div className={`text-xs font-bold mb-2 ${
                day.done ? 'text-green-800' : 'text-slate-600'
              }`}>
                {day.day}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                day.done ? 'bg-green-600' : 'bg-slate-300'
              }`}>
                {day.done && <CheckCircle className="w-5 h-5 text-white" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-900 font-serif leading-relaxed">
            "The mitzvah of Tefillin is equal to all the mitzvot" - Keep your streak going!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}