import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LearningPathway({ courses, completedCourses, currentCourse }) {
  const getStatus = (course, idx) => {
    if (completedCourses?.some(c => c.id === course.id)) return 'completed';
    if (course.id === currentCourse?.id) return 'current';
    if (idx === 0) return 'available';
    
    const prevCourse = courses[idx - 1];
    if (completedCourses?.some(c => c.id === prevCourse.id)) return 'available';
    
    return 'locked';
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-8">
        <h3 className="text-2xl font-black text-slate-900 mb-6">Your Learning Pathway</h3>
        
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />
          
          <div className="space-y-6">
            {courses.map((course, idx) => {
              const status = getStatus(course, idx);
              const Icon = 
                status === 'completed' ? CheckCircle :
                status === 'locked' ? Lock : Circle;
              
              const colors = {
                completed: 'from-green-500 to-green-600',
                current: 'from-blue-500 to-blue-600',
                available: 'from-slate-400 to-slate-500',
                locked: 'from-slate-300 to-slate-400'
              };

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-16"
                >
                  <div className={`absolute left-0 w-12 h-12 bg-gradient-to-br ${colors[status]} rounded-full flex items-center justify-center z-10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <div className={`p-4 rounded-xl transition-all ${
                    status === 'current' 
                      ? 'bg-blue-50 border-2 border-blue-500' 
                      : status === 'completed'
                      ? 'bg-green-50'
                      : status === 'locked'
                      ? 'bg-slate-50 opacity-60'
                      : 'bg-white hover:shadow-md'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{course.title}</h4>
                          {status === 'current' && (
                            <Badge className="bg-blue-500 text-white">In Progress</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{course.description}</p>
                      </div>
                      {status === 'available' && (
                        <ArrowRight className="w-5 h-5 text-blue-600 ml-2" />
                      )}
                    </div>

                    {course.duration_hours && (
                      <div className="mt-2 text-xs text-slate-500">
                        {course.duration_hours}h • {course.lesson_count || 0} lessons
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}