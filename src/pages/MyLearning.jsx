import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Clock, Award, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import LearningAnalyticsDashboard from '../components/analytics/LearningAnalyticsDashboard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyLearning() {
  const [user, setUser] = useState(null);

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

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments', user?.email],
    queryFn: () => base44.entities.CourseRegistration.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list()
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['my-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ user_email: user.email }),
    enabled: !!user?.email
  });

  const enrolledCourses = enrollments.map(e => {
    const course = courses.find(c => c.id === e.course_id);
    const courseProgress = progress.filter(p => p.course_id === e.course_id);
    const completed = courseProgress.filter(p => p.completed).length;
    const total = courseProgress.length || 1;
    
    return {
      ...course,
      progress: (completed / total) * 100,
      lastAccessed: e.updated_date
    };
  }).filter(c => c.id);

  const inProgress = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  const notStarted = enrolledCourses.filter(c => c.progress === 0);
  const completed = enrolledCourses.filter(c => c.progress === 100);

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl font-black text-slate-900 mb-2">My Learning</h1>
          <p className="text-xl text-slate-600">Track your progress across all courses</p>
        </motion.div>

        <LearningAnalyticsDashboard userEmail={user?.email} />

        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList className="bg-white rounded-2xl p-1">
            <TabsTrigger value="in-progress" className="rounded-xl">
              In Progress ({inProgress.length})
            </TabsTrigger>
            <TabsTrigger value="not-started" className="rounded-xl">
              Not Started ({notStarted.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">
              Completed ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgress.map((course, idx) => (
                <CourseProgressCard key={course.id} course={course} delay={idx * 0.1} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="not-started">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notStarted.map((course, idx) => (
                <CourseProgressCard key={course.id} course={course} delay={idx * 0.1} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completed.map((course, idx) => (
                <CourseProgressCard key={course.id} course={course} delay={idx * 0.1} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function CourseProgressCard({ course, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
        <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-2xl overflow-hidden cursor-pointer h-full">
          <div className="h-32 bg-gradient-to-br from-slate-900 to-blue-900 relative">
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-black text-lg text-slate-900 mb-1">{course.title}</h3>
              <div className="text-sm text-slate-600">
                Last accessed {new Date(course.lastAccessed).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-bold text-slate-900">{Math.round(course.progress)}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}