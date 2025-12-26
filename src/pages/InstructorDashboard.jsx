import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, DollarSign, TrendingUp, Plus, BarChart3, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function InstructorDashboard() {
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

  const { data: myCourses = [] } = useQuery({
    queryKey: ['instructor-courses', user?.email],
    queryFn: () => base44.entities.Course.filter({ instructor_email: user.email }),
    enabled: !!user?.email
  });

  const { data: allStudents = [] } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const enrollments = await base44.entities.CourseRegistration.list();
      return enrollments;
    }
  });

  const totalStudents = new Set(allStudents.filter(s => 
    myCourses.some(c => c.id === s.course_id)
  ).map(s => s.user_email)).size;

  const totalRevenue = myCourses.reduce((sum, course) => {
    const courseEnrollments = allStudents.filter(s => s.course_id === course.id).length;
    return sum + (courseEnrollments * (course.price || 0));
  }, 0);

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Active Courses', value: myCourses.length, icon: BookOpen, color: 'from-green-500 to-green-600' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'from-purple-500 to-purple-600' },
    { label: 'Avg Rating', value: '4.8', icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Enhanced Header with Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[3rem] premium-shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-950" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          
          <div className="relative p-10 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl font-black text-white mb-2">Instructor Dashboard</h1>
                <p className="text-slate-300 text-lg">Welcome back, {user?.full_name}</p>
              </div>
              <Link to={createPageUrl('CourseBuilder')}>
                <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-2xl hover:shadow-2xl transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Course
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-white font-black text-2xl">{stat.value}</div>
                    </div>
                    <div className="text-slate-300 text-sm font-medium">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* My Courses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900">My Courses</h2>
            <Button variant="outline" className="rounded-2xl">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course, idx) => {
              const courseStudents = allStudents.filter(s => s.course_id === course.id).length;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem] overflow-hidden">
                    <div className="h-40 bg-gradient-to-br from-slate-900 to-blue-900 relative">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                      </div>

                      <div className="flex gap-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          <Users className="w-3 h-3 mr-1" />
                          {courseStudents} students
                        </Badge>
                        <Badge className={course.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl" size="sm">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl" size="sm">
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {myCourses.length === 0 && (
              <div className="col-span-full">
                <Card className="glass-effect border-2 border-dashed border-slate-300 rounded-[2rem]">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No courses yet</h3>
                    <p className="text-slate-600 mb-6">Create your first course and start teaching</p>
                    <Link to={createPageUrl('CourseBuilder')}>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}