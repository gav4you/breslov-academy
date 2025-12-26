import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CourseCard({ course, userTier = 'free' }) {
  const tierIcons = {
    free: { icon: Sparkles, color: 'text-slate-500' },
    premium: { icon: Crown, color: 'text-blue-500' },
    elite: { icon: Crown, color: 'text-amber-500' }
  };

  const TierIcon = tierIcons[course.access_tier]?.icon || Sparkles;
  const tierColor = tierIcons[course.access_tier]?.color || 'text-slate-500';

  const hasAccess = 
    course.access_tier === 'free' ||
    (course.access_tier === 'premium' && ['premium', 'elite'].includes(userTier)) ||
    (course.access_tier === 'elite' && userTier === 'elite');

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800'
  };

  return (
    <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
      <motion.div
        whileHover={hasAccess ? { y: -8 } : {}}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="group overflow-hidden glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer h-full">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
            {course.thumbnail_url ? (
              <img 
                src={course.thumbnail_url} 
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
                <TierIcon className={`w-20 h-20 ${tierColor} opacity-40`} />
              </div>
            )}
            
            {!hasAccess && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                  <Crown className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-white font-bold text-lg">
                    {course.access_tier === 'premium' ? 'Premium' : 'Elite'} Access
                  </p>
                  <p className="text-slate-300 text-sm">Required to unlock</p>
                </div>
              </div>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={`${levelColors[course.level]} font-semibold shadow-lg`}>
                {course.level}
              </Badge>
              <Badge className="bg-slate-900/90 backdrop-blur-sm text-white border-0 shadow-lg">
                <TierIcon className="w-3 h-3 mr-1" />
                {course.access_tier}
              </Badge>
            </div>
          </div>

          <CardContent className="p-6">
            <h3 className="font-bold text-2xl text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
              {course.title}
            </h3>
            {course.title_hebrew && (
              <p className="text-amber-700 font-bold mb-3 text-lg" dir="rtl">
                {course.title_hebrew}
              </p>
            )}
            <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {course.description}
            </p>

            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
              <span className="font-semibold">Prof. {course.instructor}</span>
              {course.duration_hours && (
                <div className="flex items-center space-x-1 bg-slate-100 px-3 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">{course.duration_hours}h</span>
                </div>
              )}
            </div>

            {hasAccess ? (
              <Button className="w-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-semibold group">
                Enroll Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : course.price ? (
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-600 text-sm">One-time purchase</span>
                  <span className="text-3xl font-bold text-slate-900">${course.price}</span>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold">
                  Purchase Course
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Crown className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-amber-900 font-bold">Membership Required</p>
                </div>
                <p className="text-xs text-amber-700">Upgrade to unlock this course</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}