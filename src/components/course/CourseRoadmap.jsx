import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseRoadmap({ lessons = [], progress = [] }) {
  const getLessonStatus = (lesson, index) => {
    const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
    if (lessonProgress?.completed) return 'completed';
    if (index === 0) return 'available';
    
    const previousLesson = lessons[index - 1];
    const previousProgress = progress.find(p => p.lesson_id === previousLesson.id);
    if (previousProgress?.completed) return 'available';
    
    return 'locked';
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-8">
        <h3 className="text-2xl font-black text-slate-900 mb-6 font-serif">
          Course Roadmap
        </h3>
        <div className="text-sm text-amber-700 mb-6" dir="rtl">מפת הקורס</div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

          <div className="space-y-4">
            {lessons.map((lesson, idx) => {
              const status = getLessonStatus(lesson, idx);
              const isCompleted = status === 'completed';
              const isAvailable = status === 'available';
              const isLocked = status === 'locked';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative pl-16"
                >
                  {/* Status Icon */}
                  <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-600' :
                    isAvailable ? 'bg-blue-600' :
                    'bg-slate-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : isAvailable ? (
                      <Circle className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <Link to={isAvailable || isCompleted ? createPageUrl(`LessonViewer?id=${lesson.id}`) : '#'}>
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      isCompleted ? 'bg-green-50 border-green-200' :
                      isAvailable ? 'bg-blue-50 border-blue-200 hover:border-blue-400 cursor-pointer' :
                      'bg-slate-50 border-slate-200 opacity-60'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 mb-1">
                            {idx + 1}. {lesson.title}
                          </div>
                          {lesson.title_hebrew && (
                            <div className="text-sm text-amber-700 font-serif mb-2" dir="rtl">
                              {lesson.title_hebrew}
                            </div>
                          )}
                          {lesson.duration_minutes && (
                            <div className="text-xs text-slate-600">
                              {lesson.duration_minutes} minutes
                            </div>
                          )}
                        </div>
                        <Badge className={
                          isCompleted ? 'bg-green-100 text-green-800' :
                          isAvailable ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-600'
                        }>
                          {isCompleted ? 'Complete' : isAvailable ? 'Available' : 'Locked'}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}