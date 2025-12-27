import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Crown, Play, Lock, CheckCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CourseDetail() {
  const [user, setUser] = useState(null);
  const [userTier, setUserTier] = useState('free');
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      if (courses.length === 0) return null;
      
      // Verify user has membership to this course's school
      const activeSchoolId = localStorage.getItem('active_school_id');
      if (courses[0].school_id && courses[0].school_id !== activeSchoolId) {
        // Check if user has membership in course's school
        const memberships = await base44.entities.SchoolMembership.filter({
          user_email: user?.email,
          school_id: courses[0].school_id
        });
        if (memberships.length === 0) {
          return null; // No access
        }
      }
      
      return courses[0];
    },
    enabled: !!courseId && !!user
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order'),
    enabled: !!courseId
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', user?.email, courseId],
    queryFn: () => base44.entities.UserProgress.filter({ 
      user_email: user.email,
      course_id: courseId 
    }),
    enabled: !!user?.email && !!courseId
  });

  useEffect(() => {
    if (subscription?.tier) {
      setUserTier(subscription.tier);
    }
  }, [subscription]);

  if (!course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading course...</p>
      </div>
    );
  }

  const hasAccess = 
    course.access_tier === 'free' ||
    (course.access_tier === 'premium' && ['premium', 'elite'].includes(userTier)) ||
    (course.access_tier === 'elite' && userTier === 'elite');

  const completedLessons = progress.filter(p => p.completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  const getLessonStatus = (lesson) => {
    const lessonProgress = progress.find(p => p.lesson_id === lesson.id);
    return lessonProgress?.completed ? 'completed' : lessonProgress ? 'in-progress' : 'not-started';
  };

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to={createPageUrl('Courses')}>
        <Button variant="ghost" className="group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </Button>
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Badge className="bg-amber-500 text-white">
                {course.category?.replace(/_/g, ' ')}
              </Badge>
              <Badge className="bg-slate-700 text-white">
                {course.level}
              </Badge>
              <Badge className="bg-slate-700 text-white flex items-center space-x-1">
                <Crown className="w-3 h-3" />
                <span>{course.access_tier}</span>
              </Badge>
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">{course.title}</h1>
            {course.title_hebrew && (
              <h2 className="text-2xl text-amber-400 mb-4" dir="rtl">{course.title_hebrew}</h2>
            )}
            <p className="text-slate-300 text-lg mb-6">{course.description}</p>

            <div className="flex items-center space-x-6 text-slate-300">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>By {course.instructor}</span>
              </div>
              {course.duration_hours && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_hours} hours</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>{lessons.length} lessons</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            {hasAccess ? (
              <Card className="w-full bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-900 mb-2">You have access!</h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-green-900">{progressPercentage}%</div>
                    <div className="text-sm text-green-700">Complete</div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full bg-amber-50 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Crown className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="font-bold text-amber-900 mb-2">
                    {course.access_tier === 'premium' ? 'Premium' : 'Elite'} Required
                  </h3>
                  <p className="text-amber-800 text-sm mb-4">
                    Upgrade to access this course
                  </p>
                  <Link to={createPageUrl('Subscription')}>
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
                      Upgrade Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Curriculum</h2>
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson);
            const canAccess = hasAccess || lesson.is_preview;

            return (
              <Card 
                key={lesson.id}
                className={`transition-all ${
                  canAccess ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
                }`}
              >
                <CardContent className="p-6">
                  <Link 
                    to={canAccess ? createPageUrl(`LessonViewer?id=${lesson.id}`) : '#'}
                    className="block"
                    onClick={(e) => !canAccess && e.preventDefault()}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          status === 'completed' ? 'bg-green-100' :
                          status === 'in-progress' ? 'bg-blue-100' :
                          'bg-slate-100'
                        }`}>
                          {status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : canAccess ? (
                            <Play className="w-5 h-5 text-slate-600" />
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-slate-900">
                              {index + 1}. {lesson.title}
                            </h3>
                            {lesson.is_preview && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                Free Preview
                              </Badge>
                            )}
                          </div>
                          {lesson.title_hebrew && (
                            <p className="text-amber-700 text-sm" dir="rtl">{lesson.title_hebrew}</p>
                          )}
                          {lesson.duration_minutes && (
                            <p className="text-slate-500 text-sm mt-1">
                              {lesson.duration_minutes} minutes
                            </p>
                          )}
                        </div>
                      </div>

                      {canAccess && (
                        <Button variant="ghost" size="sm">
                          {status === 'completed' ? 'Review' : 'Start'}
                        </Button>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            );
          })}

          {lessons.length === 0 && (
            <Card className="bg-slate-50">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600">No lessons available yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}