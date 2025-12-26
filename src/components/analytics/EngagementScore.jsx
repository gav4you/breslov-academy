import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Award, Clock, MessageCircle, BookOpen, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function EngagementScore({ userActivity }) {
  const calculateEngagementScore = () => {
    const metrics = {
      studyTime: 85,
      consistency: 92,
      participation: 78,
      quizScores: 88,
      peerInteraction: 65,
      noteTaking: 90
    };

    const overall = Object.values(metrics).reduce((a, b) => a + b, 0) / Object.keys(metrics).length;
    
    return { overall: Math.round(overall), metrics };
  };

  const { overall, metrics } = calculateEngagementScore();

  const getScoreLabel = (score) => {
    if (score >= 90) return { label: 'Exceptional', color: 'from-amber-500 to-yellow-600' };
    if (score >= 80) return { label: 'Excellent', color: 'from-green-500 to-emerald-600' };
    if (score >= 70) return { label: 'Good', color: 'from-blue-500 to-blue-600' };
    if (score >= 60) return { label: 'Fair', color: 'from-orange-500 to-orange-600' };
    return { label: 'Needs Improvement', color: 'from-red-500 to-red-600' };
  };

  const scoreLabel = getScoreLabel(overall);

  const metricDetails = [
    { key: 'studyTime', label: 'Study Time', icon: Clock, value: metrics.studyTime },
    { key: 'consistency', label: 'Consistency', icon: Star, value: metrics.consistency },
    { key: 'participation', label: 'Participation', icon: MessageCircle, value: metrics.participation },
    { key: 'quizScores', label: 'Quiz Performance', icon: Award, value: metrics.quizScores },
    { key: 'peerInteraction', label: 'Community', icon: TrendingUp, value: metrics.peerInteraction },
    { key: 'noteTaking', label: 'Note Taking', icon: BookOpen, value: metrics.noteTaking }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <div>
            <div>Engagement Score</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ציון מעורבות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className={`w-40 h-40 mx-auto rounded-full bg-gradient-to-br ${scoreLabel.color} flex items-center justify-center shadow-2xl mb-4`}>
            <div className="text-6xl font-black text-white">{overall}</div>
          </div>
          <div className="text-2xl font-black text-slate-900 mb-1">{scoreLabel.label}</div>
          <Badge className="bg-blue-100 text-blue-800">
            Top 15% of learners
          </Badge>
        </div>

        <div className="space-y-3">
          {metricDetails.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={metric.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">{metric.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="font-bold text-blue-900 mb-2 font-serif">💡 Improvement Tips</div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Increase peer interactions by joining study groups (+{100 - metrics.peerInteraction}%)</li>
            <li>• Maintain your excellent consistency!</li>
            <li>• Continue your strong note-taking habits</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}