import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Users, Clock, Award, Play, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CourseSalesPage() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => base44.entities.Lesson.filter({ course_id: courseId }, 'order_index'),
    enabled: !!courseId
  });

  const { data: isEnrolled } = useQuery({
    queryKey: ['enrollment', user?.email, courseId],
    queryFn: async () => {
      const enrollments = await base44.entities.CourseRegistration.filter({
        user_email: user.email,
        course_id: courseId
      });
      return enrollments.length > 0;
    },
    enabled: !!user?.email && !!courseId
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.CourseRegistration.create({
        user_email: user.email,
        course_id: courseId,
        enrollment_date: new Date().toISOString(),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['enrollment']);
    }
  });

  if (!course) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const features = [
    'Lifetime access to all course materials',
    'Certificate of completion',
    'Discussion forum access',
    'Direct messaging with instructor',
    'Mobile and desktop access',
    'Downloadable resources'
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] premium-shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
          {course.thumbnail_url && (
            <div className="absolute inset-0 opacity-20">
              <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="relative p-12 md:p-16">
            <Badge className="mb-4 bg-amber-500 text-white">{course.category}</Badge>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              {course.title}
            </h1>
            {course.title_hebrew && (
              <p className="text-2xl text-amber-300 mb-6" dir="rtl">{course.title_hebrew}</p>
            )}
            <p className="text-slate-200 text-xl mb-8 max-w-3xl">{course.description}</p>
            
            <div className="flex flex-wrap items-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-white font-bold">4.9 (1,234 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-5 h-5" />
                <span>2,456 students</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-5 h-5" />
                <span>{course.duration_hours}h total</span>
              </div>
            </div>

            <div className="flex gap-4">
              {isEnrolled ? (
                <Link to={createPageUrl(`CourseDetail?id=${courseId}`)}>
                  <Button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-6 rounded-2xl text-lg">
                    <Play className="w-5 h-5 mr-2" />
                    Continue Learning
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-8 py-6 rounded-2xl text-lg"
                >
                  {course.price ? `Enroll Now - $${course.price}` : 'Enroll Free'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* What You'll Learn */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6">What You'll Learn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-1 bg-green-100 rounded-lg">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Course Curriculum</h2>
            <div className="space-y-3">
              {lessons.map((lesson, idx) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{lesson.title}</div>
                      {lesson.description && (
                        <div className="text-sm text-slate-600">{lesson.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lesson.is_free_preview && (
                      <Badge className="bg-green-100 text-green-800">Free Preview</Badge>
                    )}
                    <span className="text-sm text-slate-600">{lesson.duration_minutes} min</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructor */}
        <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
          <CardContent className="p-8">
            <h2 className="text-3xl font-black text-slate-900 mb-6">Your Instructor</h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                {course.instructor[0]}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">{course.instructor}</h3>
                <p className="text-slate-600 mt-2">Expert Torah educator with over 15 years of teaching experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}