import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitCompare, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CourseComparison({ courses = [] }) {
  const compareCourses = [
    {
      name: 'Likutey Moharan - Basic',
      price: 99,
      lessons: 12,
      duration: 8,
      certificate: true,
      liveQA: false,
      aiTutor: false
    },
    {
      name: 'Likutey Moharan - Advanced',
      price: 199,
      lessons: 24,
      duration: 16,
      certificate: true,
      liveQA: true,
      aiTutor: true,
      popular: true
    }
  ];

  const features = [
    'Video Lessons',
    'Certificate',
    'Live Q&A',
    'AI Tutor',
    'Lifetime Access'
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <GitCompare className="w-5 h-5 text-blue-600" />
          Compare Courses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3 pt-12">
            {features.map((feature, idx) => (
              <div key={idx} className="h-12 flex items-center font-semibold text-slate-700">
                {feature}
              </div>
            ))}
          </div>

          {compareCourses.map((course, idx) => (
            <div key={idx} className="space-y-3">
              {course.popular && (
                <Badge className="bg-blue-600 text-white mb-2">Most Popular</Badge>
              )}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                <div className="font-black text-slate-900 mb-2">{course.name}</div>
                <div className="text-3xl font-black text-blue-600">${course.price}</div>
              </div>

              <div className="space-y-3">
                <div className="h-12 flex items-center justify-center">
                  <span className="text-slate-900">{course.lessons} lessons</span>
                </div>
                <div className="h-12 flex items-center justify-center">
                  {course.certificate ? <Check className="w-6 h-6 text-green-600" /> : <X className="w-6 h-6 text-red-400" />}
                </div>
                <div className="h-12 flex items-center justify-center">
                  {course.liveQA ? <Check className="w-6 h-6 text-green-600" /> : <X className="w-6 h-6 text-red-400" />}
                </div>
                <div className="h-12 flex items-center justify-center">
                  {course.aiTutor ? <Check className="w-6 h-6 text-green-600" /> : <X className="w-6 h-6 text-red-400" />}
                </div>
                <div className="h-12 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <Button className={`w-full rounded-xl ${
                course.popular 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
                  : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
              }`}>
                Choose Plan
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}