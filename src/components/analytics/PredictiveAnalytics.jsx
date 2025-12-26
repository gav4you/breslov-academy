import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PredictiveAnalytics({ userData }) {
  const predictions = {
    completionLikelihood: 87,
    estimatedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    riskFactors: ['Slight decrease in study frequency last week'],
    recommendations: [
      'Join a study group for accountability',
      'Set daily study time reminder',
      'Review concepts from 2 weeks ago'
    ]
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Brain className="w-5 h-5 text-purple-600" />
          <div>
            <div>AI Predictions</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">חיזויי AI</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
          <TrendingUp className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-sm text-green-700 mb-2">Success Probability</div>
          <div className="text-5xl font-black text-slate-900 mb-3">{predictions.completionLikelihood}%</div>
          <Progress value={predictions.completionLikelihood} className="h-3" />
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-bold text-blue-900 mb-1">Predicted Completion</div>
              <div className="text-blue-800">
                {predictions.estimatedCompletionDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {predictions.riskFactors.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 mb-2" />
            <div className="text-sm font-bold text-amber-900 mb-2">Watch Out For:</div>
            <ul className="text-sm text-amber-800 space-y-1">
              {predictions.riskFactors.map((factor, idx) => (
                <li key={idx}>• {factor}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">AI Recommendations</div>
          {predictions.recommendations.map((rec, idx) => (
            <div key={idx} className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-sm text-purple-900">
              💡 {rec}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}