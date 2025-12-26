import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CompletionForecast({ courseId, userProgress }) {
  const lessonsCompleted = userProgress?.filter(p => p.completed).length || 0;
  const totalLessons = 24;
  const avgLessonsPerWeek = 3.5;
  
  const remainingLessons = totalLessons - lessonsCompleted;
  const estimatedWeeks = Math.ceil(remainingLessons / avgLessonsPerWeek);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + (estimatedWeeks * 7));

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <div>
            <div>Completion Forecast</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">תחזית סיום</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div className="text-center space-y-3">
            <Calendar className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <div className="text-sm text-green-700 mb-2">Estimated Completion</div>
              <div className="text-3xl font-black text-slate-900">
                {estimatedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {estimatedWeeks} weeks remaining
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <div className="text-2xl font-black text-blue-600">{avgLessonsPerWeek}</div>
            <div className="text-xs text-slate-600">Avg Lessons/Week</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <div className="text-2xl font-black text-purple-600">{remainingLessons}</div>
            <div className="text-xs text-slate-600">Lessons Left</div>
          </div>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900 mb-1">Speed Up Your Learning!</div>
              <div className="text-sm text-amber-800">
                Complete 5 lessons per week to finish by {new Date(Date.now() + (remainingLessons / 5) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Study Plan Recommendations</div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />
              <div className="text-slate-700">Study 30 minutes daily to stay on track</div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />
              <div className="text-slate-700">Focus on weekday mornings for consistency</div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2" />
              <div className="text-slate-700">Review notes on Shabbat for reinforcement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}