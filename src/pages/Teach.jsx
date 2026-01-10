import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Plus, FileText, CheckCircle, Users } from 'lucide-react';
import { useSession } from '@/components/hooks/useSession';
import { tokens, cx } from '@/components/theme/tokens';
import StatCard from '@/components/dashboard/StatCard';

export default function Teach() {
  const { user, activeSchoolId, isTeacher, isLoading } = useSession();
  const navigate = useNavigate();

  // Redirect if not authorized (handled mostly by router/portal, but extra safety here)
  if (!isLoading && !isTeacher) {
    // Optionally redirect or show unauthorized
  }

  const { data: myCourses = [] } = useQuery({
    queryKey: ['my-courses', user?.email, activeSchoolId],
    queryFn: async () => {
      if (!user?.email || !activeSchoolId) return [];
      
      // Get courses created by user
      const created = await base44.entities.Course.filter({
        school_id: activeSchoolId,
        created_by: user.email
      });
      
      // Get courses where user is staff
      const staffRecords = await base44.entities.CourseStaff.filter({
        school_id: activeSchoolId,
        user_email: user.email
      });
      
      const staffCourseIds = staffRecords.map(s => s.course_id);
      const staffCourses = [];
      
      for (const id of staffCourseIds) {
        const courses = await base44.entities.Course.filter({ id });
        if (courses.length > 0) staffCourses.push(courses[0]);
      }
      
      // Combine and deduplicate
      const allCourses = [...created, ...staffCourses];
      const uniqueCourses = Array.from(new Map(allCourses.map(c => [c.id, c])).values());
      
      return uniqueCourses;
    },
    enabled: !!user && !!activeSchoolId
  });

  const draftCourses = myCourses.filter(c => c.status === 'draft');
  const publishedCourses = myCourses.filter(c => c.status === 'published');

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Header */}
      <div className={cx(tokens.glass.card, "p-8 md:p-12 overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 border-none")}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left text-white">
            <h1 className={cx(tokens.text.h1, "text-white")}>Instructor Dashboard</h1>
            <p className="text-indigo-100 text-lg mt-2 max-w-xl">
              Manage your courses, track student progress, and create new learning experiences.
            </p>
          </div>
          <Link to={createPageUrl('TeachCourseNew')}>
            <Button className="bg-white text-indigo-900 hover:bg-indigo-50 font-semibold shadow-lg" size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Stats */}
      <div className={cx("grid grid-cols-1 md:grid-cols-4", tokens.layout.gridGap)}>
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={myCourses.length}
          color="text-indigo-600 dark:text-indigo-400"
          bg="bg-indigo-100 dark:bg-indigo-900/20"
        />
        <StatCard
          icon={CheckCircle}
          label="Published"
          value={publishedCourses.length}
          color="text-green-600 dark:text-green-400"
          bg="bg-green-100 dark:bg-green-900/20"
        />
        <StatCard
          icon={FileText}
          label="Drafts"
          value={draftCourses.length}
          color="text-amber-600 dark:text-amber-400"
          bg="bg-amber-100 dark:bg-amber-900/20"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value="-"
          color="text-blue-600 dark:text-blue-400"
          bg="bg-blue-100 dark:bg-blue-900/20"
        />
      </div>

      {/* Draft Courses */}
      {draftCourses.length > 0 && (
        <div>
          <h2 className={cx(tokens.text.h2, "mb-4")}>Drafts Needing Attention</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftCourses.map((course) => (
              <div key={course.id} className={cx(tokens.glass.card, tokens.glass.cardHover)}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-foreground">{course.title}</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Draft
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {course.description || 'No description provided.'}
                  </p>
                  <Link to={createPageUrl(`TeachCourse?id=${course.id}`)}>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Continue Editing
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className={cx(tokens.text.h2, "mb-4")}>My Courses</h2>
        <div className={cx("grid grid-cols-1 md:grid-cols-3", tokens.layout.gridGap)}>
          {myCourses.map((course) => (
            <Link key={course.id} to={createPageUrl(`TeachCourse?id=${course.id}`)} className="group block h-full">
              <div className={cx(tokens.glass.card, tokens.glass.cardHover, "h-full flex flex-col overflow-hidden")}>
                <div className="relative h-40 bg-muted">
                  {course.cover_image_url ? (
                    <img 
                      src={course.cover_image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                      <BookOpen className="w-10 h-10 text-indigo-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'} className="shadow-sm">
                      {course.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className={cx(tokens.text.h3, "mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1")}>
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {course.category || 'General'}
                    </span>
                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 -mr-2">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {myCourses.length === 0 && (
          <div className={cx(tokens.glass.card, "text-center py-16 border-2 border-dashed border-border/50")}>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No courses yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first course to start teaching and sharing your knowledge.
            </p>
            <Link to={createPageUrl('TeachCourseNew')}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}