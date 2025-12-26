import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SkillGapAnalysis({ userSkills = {} }) {
  const gaps = [
    {
      skill: 'Talmudic Aramaic',
      current: 45,
      target: 75,
      importance: 'high',
      recommendedCourse: 'Aramaic Mastery',
      courseId: 'aramaic-101'
    },
    {
      skill: 'Halacha Application',
      current: 65,
      target: 85,
      importance: 'medium',
      recommendedCourse: 'Practical Halacha',
      courseId: 'halacha-101'
    },
    {
      skill: 'Kabbalistic Concepts',
      current: 52,
      target: 80,
      importance: 'medium',
      recommendedCourse: 'Introduction to Kabbalah',
      courseId: 'kabbalah-101'
    }
  ];

  const importanceColors = {
    high: 'bg-red-100 text-red-800 border-red-300',
    medium: 'bg-orange-100 text-orange-800 border-orange-300',
    low: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Target className="w-5 h-5 text-red-600" />
          <div>
            <div>Skill Gap Analysis</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ניתוח פערי ידע</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <strong>AI Analysis:</strong> Based on your quiz performance and lesson completion, we've identified areas for focused improvement
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {gaps.map((gap, idx) => {
            const gapSize = gap.target - gap.current;
            const progressToTarget = (gap.current / gap.target) * 100;
            
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${importanceColors[gap.importance]}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-black text-slate-900 mb-1">{gap.skill}</div>
                    <Badge className={`${importanceColors[gap.importance]} text-xs capitalize`}>
                      {gap.importance} priority
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900">{gap.current}%</div>
                    <div className="text-xs text-slate-600">of {gap.target}%</div>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progress to target</span>
                    <span className="font-bold">{Math.round(progressToTarget)}%</span>
                  </div>
                  <Progress value={progressToTarget} className="h-2" />
                  <div className="text-xs text-slate-600">
                    Need {gapSize}% improvement
                  </div>
                </div>

                <Link to={createPageUrl(`CourseDetail?id=${gap.courseId}`)}>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Start {gap.recommendedCourse}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <TrendingUp className="w-5 h-5 text-green-600 mb-2" />
          <div className="font-bold text-green-900 mb-2">Your Strengths</div>
          <div className="space-y-1 text-sm text-green-800">
            <div>• Torah Hebrew: 92% (Excellent)</div>
            <div>• Likutey Moharan: 88% (Strong foundation)</div>
            <div>• Study consistency: 94% (Outstanding)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}