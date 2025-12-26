import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertTriangle, Award, MessageCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentProgressDashboard({ courseId, students = [] }) {
  const performanceData = [
    { range: '90-100%', count: 8 },
    { range: '80-90%', count: 12 },
    { range: '70-80%', count: 6 },
    { range: '60-70%', count: 3 },
    { range: '<60%', count: 2 }
  ];

  const metrics = {
    avgCompletion: 76,
    avgScore: 82,
    atRisk: 5,
    excelling: 8,
    avgEngagement: 84
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Users className="w-5 h-5 text-blue-600" />
          <div>
            <div>Class Overview</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">סקירת כיתה</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{students.length}</div>
            <div className="text-xs text-slate-600">Total Students</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{metrics.avgCompletion}%</div>
            <div className="text-xs text-slate-600">Avg Completion</div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{metrics.avgScore}%</div>
            <div className="text-xs text-slate-600">Avg Score</div>
          </div>
          
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{metrics.atRisk}</div>
            <div className="text-xs text-slate-600">At Risk</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded-xl border border-green-200 text-center">
            <Award className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{metrics.excelling}</div>
            <div className="text-xs text-slate-600">Excelling</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-700 mb-3">Performance Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceData}>
              <XAxis dataKey="range" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold text-slate-700">Students Needing Attention</div>
          {[
            { name: 'Yosef K.', issue: 'Low completion (32%)', action: 'Send encouragement' },
            { name: 'Rachel B.', issue: 'Quiz scores declining', action: 'Schedule 1-on-1' },
            { name: 'Aaron L.', issue: 'No activity 10 days', action: 'Check in' }
          ].map((student, idx) => (
            <div
              key={idx}
              className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                <div className="text-xs text-slate-600">{student.issue}</div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {student.action}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}