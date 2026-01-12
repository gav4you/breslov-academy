import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { scopedFilter } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import PremiumVideoPlayer from '@/components/learning/PremiumVideoPlayer';
import BookmarkPanel from '@/components/learning/BookmarkPanel';
import TranscriptPanel from '@/components/learning/TranscriptPanel';
import NotesPanel from '@/components/learning/NotesPanel';
import AiTutorPanel from '@/components/ai/AiTutorPanel';
import { useLessonAccess } from '@/components/hooks/useLessonAccess';
import { shouldFetchMaterials } from '@/components/materials/materialsEngine';
import ProtectedContent from '@/components/protection/ProtectedContent';
import AccessGate from '@/components/security/AccessGate';
import { tokens } from '@/components/theme/tokens';

export default function LessonViewerPremium() {
  const { user, activeSchool, activeSchoolId, isLoading } = useSession();
  const [currentTime, setCurrentTime] = useState(0);
  const queryClient = useQueryClient();
  const videoPlayerRef = useRef(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');
  const lessonMetaFields = useMemo(() => ([
    'id',
    'school_id',
    'course_id',
    'title',
    'title_hebrew',
    'is_preview',
    'drip_publish_at',
    'drip_days_after_enroll',
    'order',
    'duration_minutes',
    'duration_seconds'
  ]), []);
  const lessonContentFields = useMemo(() => ([
    'id',
    'school_id',
    'course_id',
    'title',
    'title_hebrew',
    'content',
    'content_json',
    'video_url',
    'video_stream_id',
    'audio_url',
    'duration_seconds',
    'duration_minutes',
    'is_preview',
    'drip_publish_at',
    'drip_days_after_enroll',
    'order'
  ]), []);
  const lessonListFields = useMemo(() => ([
    'id',
    'course_id',
    'title',
    'title_hebrew',
    'order',
    'is_preview',
    'duration_minutes',
    'status'
  ]), []);

  useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

  // Lesson metadata (safe fields only)
  const { data: lessonMeta } = useQuery({
    queryKey: ['lesson-meta', activeSchoolId, lessonId],
    queryFn: async () => {
      if (!activeSchoolId || !lessonId) return null;
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId }, null, 1, { fields: lessonMetaFields });
      const l = lessons?.[0] || null;
      if (!l) return null;
      return {
        id: l.id,
        school_id: l.school_id,
        course_id: l.course_id,
        title: l.title,
        is_preview: l.is_preview,
        drip_publish_at: l.drip_publish_at,
        drip_days_after_enroll: l.drip_days_after_enroll,
      };
    },
    enabled: !!activeSchoolId && !!lessonId,
    staleTime: 30_000,
  });

  // Access control (membership-first)
  const access = useLessonAccess(
    lessonMeta?.course_id,
    lessonId,
    user,
    activeSchoolId,
    { lessonMeta }
  );

  const shouldLoadLesson = access.accessLevel === 'FULL' || access.accessLevel === 'PREVIEW';

  // Full lesson payload (only when FULL or PREVIEW)
  const { data: lesson } = useQuery({
    queryKey: ['lesson-full', activeSchoolId, lessonId, access.accessLevel, access.maxPreviewChars],
    queryFn: async () => {
      const previewChars = access.accessLevel === 'PREVIEW'
        ? (access.maxPreviewChars || 1500)
        : null;
      const lessons = await scopedFilter(
        'Lesson',
        activeSchoolId,
        { id: lessonId },
        null,
        1,
        { fields: lessonContentFields, previewChars }
      );
      return lessons?.[0] || null;
    },
    enabled: !!activeSchoolId && !!lessonId && shouldLoadLesson,
    staleTime: 15_000,
  });

  const effectiveCourseId = lessonMeta?.course_id || lesson?.course_id;
  const allowCourseData = access.accessLevel === 'FULL' || access.accessLevel === 'PREVIEW';

  const { data: course } = useQuery({
    queryKey: ['course', activeSchoolId, effectiveCourseId],
    queryFn: async () => {
      const courses = await scopedFilter('Course', activeSchoolId, { id: effectiveCourseId });
      return courses[0];
    },
    enabled: !!activeSchoolId && !!effectiveCourseId && allowCourseData
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', activeSchoolId, effectiveCourseId],
    queryFn: () => scopedFilter(
      'Lesson',
      activeSchoolId,
      { course_id: effectiveCourseId },
      'order',
      1000,
      { fields: lessonListFields }
    ),
    enabled: !!activeSchoolId && !!effectiveCourseId && allowCourseData
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', activeSchoolId, user?.email, lessonId],
    queryFn: async () => {
      const progs = await scopedFilter('UserProgress', activeSchoolId, {
        user_email: user.email,
        lesson_id: lessonId,
      });
      return progs[0] || null;
    },
    enabled: !!activeSchoolId && !!user?.email && !!lessonId && access.accessLevel === 'FULL'
  });

  const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
  const rawContent = lesson?.content || lesson?.content_json || '';
  const maxChars = access.maxPreviewChars || 1500;
  const contentToShow = (access.accessLevel === 'FULL')
    ? rawContent
    : (access.accessLevel === 'PREVIEW')
      ? (rawContent.slice(0, maxChars) + (rawContent.length > maxChars ? '…' : ''))
      : '';

  if (access.accessLevel === 'LOCKED' || access.accessLevel === 'DRIP_LOCKED') {
    return (
      <AccessGate
        mode={access.accessLevel}
        courseId={effectiveCourseId}
        schoolSlug={activeSchool?.slug}
        message={access.accessLevel === 'DRIP_LOCKED' ? (access.dripInfo?.countdownLabel || 'This lesson will unlock soon.') : undefined}
      />
    );
  }

  if (!lesson || !course) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4 animate-pulse" />
        <p className="text-slate-600">Loading lesson...</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Header */}
      <div>
        <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
          <Button variant="ghost" className="group mb-4 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {course.title}
          </Button>
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="relative z-10">
            <p className="text-primary/80 text-sm mb-2 font-medium tracking-wide uppercase">{course.title}</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{lesson.title}</h1>
            {lesson.title_hebrew && (
              <h2 className="text-2xl text-amber-400/90 font-serif" dir="rtl">{lesson.title_hebrew}</h2>
            )}
            <div className="flex items-center space-x-2 mt-4">
              {progress?.completed && (
                <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/10">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Completed
                </Badge>
              )}
              {access.accessLevel === 'PREVIEW' && (
                <Badge className="bg-amber-500 text-black border-none">Preview Mode</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Video Player */}
      {canFetchMaterials && (lesson.video_url || lesson.audio_url) && (
        <div ref={videoPlayerRef} className="rounded-2xl overflow-hidden shadow-lg border border-border/50">
          <PremiumVideoPlayer
            lesson={lesson}
            progress={progress}
            user={user}
            accessLevel={access.accessLevel}
            maxPreviewSeconds={access.maxPreviewSeconds}
            onProgressUpdate={() => queryClient.invalidateQueries(['progress'])}
          />
        </div>
      )}

      {/* Lesson Content & Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content">Lesson Content</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0">
              <ProtectedContent
                policy={access.policy}
                userEmail={user?.email}
                schoolName={activeSchool?.name}
                canCopy={access.canCopy}
                canDownload={access.canDownload}
              >
                <Card className="border-none shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline">
                      {canFetchMaterials ? (contentToShow || 'No content available.') : 'This lesson is locked.'}
                    </ReactMarkdown>
                    
                    {access.accessLevel === 'PREVIEW' && (
                      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-center">
                        <p className="text-amber-800 dark:text-amber-300 mb-4 font-medium">You've reached the end of the preview.</p>
                        <Link to={createPageUrl(`CourseSales?slug=${activeSchool?.slug}&courseId=${course.id}`)}>
                          <Button className="bg-primary hover:bg-primary/90 shadow-md">
                            Unlock Full Course
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ProtectedContent>
            </TabsContent>

            <TabsContent value="transcript" className="mt-0">
              <TranscriptPanel lesson={lesson} accessLevel={access.accessLevel} maxPreviewChars={access.maxPreviewChars} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar Tools */}
        <div className="space-y-6">
          <AiTutorPanel
            contextType="LESSON"
            contextId={lesson.id}
            contextTitle={lesson.title}
            contextContent={canFetchMaterials ? contentToShow : ''}
            contextCourseId={lesson.course_id}
            user={user}
            schoolId={lesson.school_id}
          />

          <BookmarkPanel
            lesson={lesson}
            user={user}
            currentTime={currentTime}
            onSeek={(time) => {
              if (videoPlayerRef.current?.seekTo) {
                videoPlayerRef.current.seekTo(time);
              }
            }}
          />

          <NotesPanel lesson={lesson} user={user} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-border">
        {previousLesson ? (
          <Link to={createPageUrl(`LessonViewerPremium?id=${previousLesson.id}`)}>
            <Button variant="outline" className="group h-12 px-6">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              <div>
                <span className="block text-xs text-muted-foreground text-left">Previous</span>
                <span className="block font-semibold">{previousLesson.title}</span>
              </div>
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link to={createPageUrl(`LessonViewerPremium?id=${nextLesson.id}`)}>
            <Button className="group h-12 px-6 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground">
              <div className="text-right">
                <span className="block text-xs opacity-80">Next Lesson</span>
                <span className="block font-semibold">{nextLesson.title}</span>
              </div>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        ) : (
          <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
            <Button className="bg-green-600 hover:bg-green-700 h-12 px-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Course
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
