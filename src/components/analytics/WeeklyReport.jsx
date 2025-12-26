import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, Clock, BookOpen, Target } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyReport({ weekData }) {
  const thisWeek = [
    { day: 'Sun', hours: 2.5, lessons: 3, xp: 250 },
    { day: 'Mon', hours: 3.2, lessons: 4, xp: 320 },
    { day: 'Tue', hours: 1.8, lessons: 2, xp: 180 },
    { day: 'Wed', hours: 4.1, lessons: 5, xp: 410 },
    { day: 'Thu', hours: 2.9, lessons: 3, xp: 290 },
    { day: 'Fri', hours: 5.5, lessons: 6, xp: 550 },
    { day: 'Sat', hours: 3.3, lessons: 4, xp: 330 }
  ];

  const totalHours = thisWeek.reduce((sum, day) => sum + day.hours, 0);
  const totalLessons = thisWeek.reduce((sum, day) => sum + day.lessons, 0);
  const totalXP = thisWeek.reduce((sum, day) => sum + day.xp, 0);
  const avgHoursPerDay = (totalHours / 7).toFixed(1);

  const lastWeekTotal = 18.5;
  const percentChange = ((totalHours - lastWeekTotal) / lastWeekTotal * 100).toFixed(1);
  const isIncrease = percentChange > 0;

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <div>This Week's Progress</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">התקדמות שבועית</div>
            </div>
          </div>
          <Badge className={isIncrease ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {isIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(percentChange)}% vs last week
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-200">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{totalHours.toFixed(1)}</div>
            <div className="text-xs text-slate-600">Hours</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-200">
            <BookOpen className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{totalLessons}</div>
            <div className="text-xs text-slate-600">Lessons</div>
          </div>
          <div className="text-center p-3 bg-amber-50 rounded-xl border border-amber-200">
            <Award className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{totalXP}</div>
            <div className="text-xs text-slate-600">XP Earned</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
            <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{avgHoursPerDay}</div>
            <div className="text-xs text-slate-600">Avg/Day</div>
          </div>
        </div>

        {/* Daily Hours Chart */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 font-serif">Daily Study Time</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={thisWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* XP Trend */}
        <div>
          <h4 className="font-bold text-slate-900 mb-3 font-serif">Experience Points</h4>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={thisWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="xp" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <div className="font-bold text-slate-900 mb-2 font-serif">✨ This Week's Insights</div>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Your most productive day was <strong>Friday</strong> with 5.5 hours</li>
            <li>• You completed <strong>6 lessons</strong> on Shabbat - amazing dedication!</li>
            <li>• Study consistently earlier in the day for better retention</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}