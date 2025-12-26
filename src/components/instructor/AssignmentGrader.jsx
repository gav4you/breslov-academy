import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardCheck, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AssignmentGrader({ submissions = [] }) {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  const sampleSubmissions = [
    {
      student: 'Moshe L.',
      title: 'Azamra Essay',
      submitted: new Date(),
      status: 'pending',
      content: 'The teaching of Azamra...'
    },
    {
      student: 'David K.',
      title: 'Torah Reflection',
      submitted: new Date(Date.now() - 86400000),
      status: 'graded',
      grade: 92,
      feedback: 'Excellent understanding!'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <ClipboardCheck className="w-5 h-5 text-blue-600" />
          <div>
            <div>Grade Assignments</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ציון מטלות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sampleSubmissions.map((sub, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border-2 ${
              sub.status === 'pending' 
                ? 'bg-amber-50 border-amber-200' 
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-bold text-slate-900">{sub.student}</div>
                <div className="text-sm text-slate-600">{sub.title}</div>
              </div>
              <Badge className={
                sub.status === 'pending' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-green-600 text-white'
              }>
                {sub.status}
              </Badge>
            </div>

            <div className="text-xs text-slate-600 mb-3">
              Submitted: {sub.submitted.toLocaleDateString()}
            </div>

            {sub.status === 'graded' ? (
              <div className="p-3 bg-white rounded-lg">
                <div className="font-bold text-green-900 mb-1">Grade: {sub.grade}%</div>
                <div className="text-sm text-slate-700">{sub.feedback}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Grade (0-100)"
                  className="rounded-lg"
                />
                <Textarea
                  placeholder="Feedback..."
                  className="min-h-[80px] rounded-lg"
                />
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
                >
                  Submit Grade
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}