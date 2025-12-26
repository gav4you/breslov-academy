import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PrerequisiteChecker({ prerequisites = [], userProgress = [] }) {
  const checkPrerequisite = (prereq) => {
    const progress = userProgress.find(p => p.course_id === prereq.courseId);
    return progress?.completed || false;
  };

  const allMet = prerequisites.every(checkPrerequisite);
  const metCount = prerequisites.filter(checkPrerequisite).length;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-900">Prerequisites</h3>
          <Badge className={allMet ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {metCount} / {prerequisites.length}
          </Badge>
        </div>

        {prerequisites.length === 0 ? (
          <div className="text-center py-4 text-slate-600">
            No prerequisites required
          </div>
        ) : (
          <div className="space-y-2">
            {prerequisites.map((prereq, idx) => {
              const isMet = checkPrerequisite(prereq);
              
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 ${
                    isMet 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isMet ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{prereq.title}</div>
                    <div className="text-xs text-slate-600">{prereq.description}</div>
                  </div>
                  {!isMet && (
                    <Link to={createPageUrl(`CourseDetail?id=${prereq.courseId}`)}>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        View
                      </Button>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!allMet && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-900">
              Complete the required courses before starting this advanced shiur
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}