import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CourseProgress({ course }) {
  const progress = course?.progress || 45;
  const lessonsCompleted = course?.lessonsCompleted || 12;
  const totalLessons = course?.totalLessons || 24;

  return (
    <div className="glass-effect border-0 premium-shadow-lg rounded-2xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            {course?.title || 'Course Title'}
          </h3>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-100 text-blue-800">
              <BookOpen className="w-3 h-3 mr-1" />
              {lessonsCompleted}/{totalLessons} lessons
            </Badge>
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              {progress}% complete
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Overall Progress</span>
          <span className="font-bold text-slate-900">{progress}%</span>
        </div>
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Clock className="w-4 h-4" />
        <span>Estimated time remaining: <span className="font-bold text-slate-900">12 hours</span></span>
      </div>
    </div>
  );
}