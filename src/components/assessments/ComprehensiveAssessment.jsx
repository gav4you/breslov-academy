import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ComprehensiveAssessment({ courseId }) {
  const [started, setStarted] = useState(false);

  const assessment = {
    title: 'Likutey Moharan Mastery Assessment',
    sections: [
      { name: 'Multiple Choice', questions: 20, points: 40 },
      { name: 'Short Answer', questions: 5, points: 30 },
      { name: 'Essay', questions: 2, points: 30 }
    ],
    timeLimit: 120,
    passingScore: 75
  };

  const totalQuestions = assessment.sections.reduce((sum, s) => sum + s.questions, 0);

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          Final Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="text-2xl font-black text-slate-900 mb-2">{assessment.title}</div>
          <p className="text-slate-600">Comprehensive evaluation of your Torah knowledge</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <ClipboardCheck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{totalQuestions}</div>
            <div className="text-xs text-slate-600">Questions</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{assessment.timeLimit}</div>
            <div className="text-xs text-slate-600">Minutes</div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <Award className="w-6 h-6 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{assessment.passingScore}%</div>
            <div className="text-xs text-slate-600">To Pass</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Assessment Sections</div>
          {assessment.sections.map((section, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 flex justify-between">
              <span className="font-semibold text-slate-900">{section.name}</span>
              <div className="text-sm text-slate-600">
                {section.questions} questions • {section.points} pts
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => setStarted(true)}
          size="lg"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl"
        >
          Begin Assessment
        </Button>
      </CardContent>
    </Card>
  );
}