import React from 'antml:function_calls';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function EngagementPredictor({ studentData }) {
  const prediction = {
    retentionProbability: 78,
    completionLikelihood: 85,
    riskLevel: 'low',
    factors: [
      { name: 'Consistent login pattern', impact: 'positive' },
      { name: 'High quiz scores', impact: 'positive' },
      { name: 'Decreasing session time', impact: 'negative' }
    ]
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Engagement Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <div className="text-3xl font-black text-green-600">{prediction.retentionProbability}%</div>
            <div className="text-xs text-slate-600">Retention</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <div className="text-3xl font-black text-blue-600">{prediction.completionLikelihood}%</div>
            <div className="text-xs text-slate-600">Completion</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Risk Factors</div>
          {prediction.factors.map((factor, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start gap-2 ${
                factor.impact === 'positive' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              {factor.impact === 'positive' ? (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
              )}
              <span className="text-sm text-slate-700">{factor.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}