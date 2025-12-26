import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Specialization({ specialization, courses, progress }) {
  const completedCourses = courses?.filter(c => 
    progress?.some(p => p.course_id === c.id && p.completed)
  ).length || 0;
  
  const totalCourses = courses?.length || 0;
  const percentage = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;

  return (
    <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all rounded-[2rem] overflow-hidden">
      <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-600" />
      <CardContent className="p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <Badge className="bg-indigo-100 text-indigo-800 mb-2">Specialization</Badge>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{specialization.name}</h3>
            <p className="text-slate-600">{specialization.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-bold text-slate-900">{completedCourses}/{totalCourses} courses</span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-bold text-slate-900 text-sm mb-2">Included Courses:</div>
          {courses?.slice(0, 3).map((course, idx) => (
            <div key={course.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700 flex-1">{course.title}</span>
              {progress?.some(p => p.course_id === course.id && p.completed) && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
          ))}
          {totalCourses > 3 && (
            <div className="text-sm text-slate-600 text-center">
              +{totalCourses - 3} more courses
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-slate-900">Earn a Specialization Certificate</span>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Complete all {totalCourses} courses to earn your official specialization certificate
          </p>
        </div>

        <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-6 rounded-2xl btn-premium group">
          <span className="flex items-center justify-center gap-2">
            {percentage === 100 ? 'Claim Certificate' : 'Continue Specialization'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}