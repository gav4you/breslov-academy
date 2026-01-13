import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSession } from '@/components/hooks/useSession';
import { scopedFilter } from '@/components/api/scoped';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, Settings as SettingsIcon, Users, DollarSign, BookOpen, Eye } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';
import CurriculumEditor from '@/components/instructor/CurriculumEditor'; // NEW DnD EDITOR
import TeachCoursePricing from '@/components/instructor/TeachCoursePricing';
import TeachCourseStudents from '@/components/instructor/TeachCourseStudents';
import TeachCourseSettings from '@/components/instructor/TeachCourseSettings';

export default function TeachCourse() {
  const { user, activeSchoolId } = useSession();
  const [courseId, setCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState('curriculum');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setCourseId(id);
  }, []);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId, activeSchoolId],
    queryFn: async () => {
      // For "New Course" flow or mock, return a placeholder if ID is missing
      if (!courseId) return { id: 'new', title: 'New Course Draft', subtitle: 'Untitled' };
      const courses = await scopedFilter('Course', activeSchoolId, { id: courseId });
      return courses[0] || null;
    },
    enabled: !!activeSchoolId
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl">Course not found</h2>
        <Button onClick={() => navigate(createPageUrl('Teach'))}>Back</Button>
      </div>
    );
  }

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Header */}
      <div className={cx(tokens.glass.card, "p-8 md:p-12 overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 border-none")}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <Button 
              variant="ghost" 
              onClick={() => navigate(createPageUrl('Teach'))}
              className="text-white/80 hover:text-white hover:bg-white/10 mb-4 pl-0 -ml-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <h1 className={cx(tokens.text.h1, "text-white mb-2")}>{course.title}</h1>
            <p className="text-indigo-100/80 text-lg font-medium">{course.subtitle || 'Course Builder'}</p>
          </div>
          
          <Button 
            className="bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-sm"
            onClick={() => window.open(createPageUrl(`CourseDetail?id=${course.id}`), '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Course
          </Button>
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className={tokens.glass.card}>
          <TabsList className="grid w-full grid-cols-4 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="curriculum" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <BookOpen className="w-4 h-4 mr-2" />
              Curriculum
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-[500px]">
          <TabsContent value="curriculum" className="mt-0 focus-visible:outline-none">
            {/* The New Drag and Drop Editor */}
            <CurriculumEditor />
          </TabsContent>

          <TabsContent value="pricing" className="mt-0 focus-visible:outline-none">
            <TeachCoursePricing course={course} schoolId={activeSchoolId} />
          </TabsContent>

          <TabsContent value="students" className="mt-0 focus-visible:outline-none">
            <TeachCourseStudents course={course} schoolId={activeSchoolId} />
          </TabsContent>

          <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
            <TeachCourseSettings course={course} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
