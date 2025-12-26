import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RetentionPredictor({ lessonData }) {
  const retentionCurve = [
    { day: 0, retention: 100 },
    { day: 1, retention: 75 },
    { day: 3, retention: 58 },
    { day: 7, retention: 45 },
    { day: 14, retention: 35 },
    { day: 30, retention: 25 }
  ];

  const concepts = [
    { name: 'Azamra concept', retention: 85, daysAgo: 2, needsReview: false },
    { name: 'Hitbodedut practice', retention: 62, daysAgo: 7, needsReview: true },
    { name: 'Joy as mitzvah', retention: 45, daysAgo: 14, needsReview: true }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <div>Memory Retention</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">שימור זיכרון</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-sm font-bold text-slate-700 mb-3">Forgetting Curve</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={retentionCurve}>
              <XAxis dataKey="day" stroke="#64748b" label={{ value: 'Days', position: 'bottom' }} />
              <YAxis stroke="#64748b" label={{ value: '%', angle: -90, position: 'left' }} />
              <Tooltip />
              <Line type="monotone" dataKey="retention" stroke="#ef4444" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-xs text-slate-600 text-center mt-2">
            Without review, retention drops significantly after 7 days
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-bold text-slate-700">Concept Retention</div>
          {concepts.map((concept, idx) => {
            const needsReview = concept.retention < 70;
            
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  needsReview 
                    ? 'bg-orange-50 border-orange-300' 
                    : 'bg-green-50 border-green-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-bold text-slate-900">{concept.name}</div>
                    <div className="text-xs text-slate-600">
                      Learned {concept.daysAgo} days ago
                    </div>
                  </div>
                  {needsReview && (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Retention estimate</span>
                    <span className="font-bold text-slate-900">{concept.retention}%</span>
                  </div>
                  <Progress value={concept.retention} className="h-2" />
                </div>

                {needsReview && (
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Review Now
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-900 font-serif leading-relaxed">
            💡 <strong>Optimal review schedule:</strong> Review at 1 day, 3 days, 7 days, and 30 days for long-term retention
          </div>
        </div>
      </CardContent>
    </Card>
  );
}