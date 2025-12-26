import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrerequisiteCheck({ prerequisites, completedCourses, onBypass }) {
  const unmetPrereqs = prerequisites?.filter(
    prereq => !completedCourses?.some(c => c.id === prereq.prerequisite_course_id)
  ) || [];

  const canEnroll = unmetPrereqs.length === 0;

  if (prerequisites?.length === 0) return null;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-slate-600" />
          <h3 className="font-bold text-slate-900">Prerequisites</h3>
        </div>

        <div className="space-y-3">
          {prerequisites?.map((prereq, idx) => {
            const isCompleted = completedCourses?.some(c => c.id === prereq.prerequisite_course_id);
            
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isCompleted ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="font-medium text-slate-900">
                      {prereq.prerequisite_course_title || 'Required Course'}
                    </div>
                    {!isCompleted && (
                      <div className="text-xs text-slate-600">Must be completed first</div>
                    )}
                  </div>
                </div>
                {!isCompleted && prereq.prerequisite_course_id && (
                  <Link to={createPageUrl(`CourseDetail?id=${prereq.prerequisite_course_id}`)}>
                    <Button size="sm" variant="outline" className="rounded-xl">
                      <BookOpen className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {!canEnroll && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900 mb-1">Prerequisites Required</div>
                <div className="text-sm text-amber-700">
                  Complete {unmetPrereqs.length} prerequisite course{unmetPrereqs.length > 1 ? 's' : ''} to unlock this course.
                </div>
              </div>
            </div>
          </div>
        )}

        {canEnroll && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">All prerequisites completed!</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}