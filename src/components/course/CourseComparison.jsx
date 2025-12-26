import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseComparison({ courses, onSelect }) {
  const features = [
    'Video Lessons',
    'Lifetime Access',
    'Certificate',
    'Downloadable Resources',
    'Quizzes & Assessments',
    'Discussion Forum',
    'Live Office Hours',
    'Group Projects',
    '1-on-1 Mentorship',
    'Job Placement Support'
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] overflow-x-auto">
      <CardContent className="p-8">
        <h2 className="text-3xl font-black text-slate-900 mb-8">Compare Courses</h2>
        
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left p-4 font-bold text-slate-900">Features</th>
              {courses.map((course, idx) => (
                <th key={course.id} className="p-4 text-center min-w-[200px]">
                  <div className="space-y-2">
                    <div className="font-black text-slate-900">{course.title}</div>
                    <div className="text-2xl font-black text-blue-600">${course.price}</div>
                    <Button
                      size="sm"
                      onClick={() => onSelect?.(course.id)}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                    >
                      Enroll
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((feature, idx) => (
              <motion.tr
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="border-b border-slate-100 hover:bg-slate-50"
              >
                <td className="p-4 text-slate-700">{feature}</td>
                {courses.map(course => {
                  const hasFeature = Math.random() > 0.3; // Demo logic
                  return (
                    <td key={course.id} className="p-4 text-center">
                      {hasFeature ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}