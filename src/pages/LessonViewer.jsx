import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useSession } from '@/components/hooks/useSession';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import DiscussionThread from '@/components/learning/DiscussionThread';
import AdvancedVideoPlayer from '@/components/video/AdvancedVideoPlayer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import { shouldFetchMaterials } from '@/components/materials/materialsEngine';
import { toast } from 'sonner';
import { useLessonAccess } from '@/components/hooks/useLessonAccess';
import { scopedFilter, scopedCreate, scopedUpdate } from '@/components/api/scoped';
import ProtectedContent from '@/components/protection/ProtectedContent';
import AccessGate from '@/components/security/AccessGate';
import { tokens, cx } from '@/components/theme/tokens';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function LessonViewer() {
  const { user, activeSchool, activeSchoolId, isLoading } = useSession();
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

  useEffect(() => {
    if (!isLoading && !user) {
      try { base44.auth.redirectToLogin(); } catch {}
    }
  }, [isLoading, user]);

  // Lesson metadata (safe fields only)
  const { data: lessonMeta, isLoading: isLoadingMeta } = useQuery({
    queryKey: ['lesson-meta', lessonId, activeSchoolId],
    queryFn: async () => {
      if (!lessonId || !activeSchoolId) return null;
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
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
        order: l.order,
      };
    },
    enabled: !!lessonId && !!activeSchoolId,
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
  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ['lesson-full', lessonId, activeSchoolId],
    queryFn: async () => {
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
      return lessons?.[0] || null;
    },
    enabled: !!lessonId && !!activeSchoolId && shouldLoadLesson,
    staleTime: 15_000,
  });

  const effectiveCourseId = lessonMeta?.course_id || lesson?.course_id;

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', effectiveCourseId, activeSchoolId],
    queryFn: async () => {
      const courses = await scopedFilter('Course', activeSchoolId, { id: effectiveCourseId });
      return courses[0];
    },
    enabled: !!effectiveCourseId && !!activeSchoolId
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', effectiveCourseId, activeSchoolId],
    queryFn: () => scopedFilter('Lesson', activeSchoolId, { course_id: effectiveCourseId }, 'order'),
    enabled: !!effectiveCourseId && !!activeSchoolId
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email, lessonId, activeSchoolId],
    queryFn: async () => {
      const progs = await scopedFilter('UserProgress', activeSchoolId, { 
        user_email: user.email,
        lesson_id: lessonId 
      });
      return progs[0];
    },
    enabled: !!user?.email && !!lessonId && !!activeSchoolId
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', effectiveCourseId, lessonId, activeSchoolId],
    queryFn: () => scopedFilter('Discussion', activeSchoolId, { 
      course_id: effectiveCourseId,
      lesson_id: lessonId 
    }, '-created_date'),
    enabled: !!effectiveCourseId && !!activeSchoolId
  });

  // Access control (computed above)
  const canFetchMaterials = shouldFetchMaterials(access.accessLevel);
  const rawContent = String(lesson?.content || lesson?.content_json || lesson?.text || '');
  const maxChars = access.maxPreviewChars || 1500;
  const contentToShow = (access.accessLevel === 'FULL')
    ? rawContent
    : (access.accessLevel === 'PREVIEW')
      ? (rawContent.slice(0, maxChars) + (rawContent.length > maxChars ? '…' : ''))
      : '';

  useEffect(() => {
    if (progress?.notes) {
      setNotes(progress.notes);
    }
  }, [progress]);

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        return await scopedUpdate('UserProgress', progress.id, {
          completed: true,
          progress_percentage: 100
        }, activeSchoolId, true);
      } else {
        return await scopedCreate('UserProgress', activeSchoolId, {
          user_email: user.email,
          lesson_id: lessonId,
          course_id: effectiveCourseId,
          completed: true,
          progress_percentage: 100
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Lesson marked as complete!');
    }
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (noteContent) => {
      if (progress) {
        return await scopedUpdate('UserProgress', progress.id, { notes: noteContent }, activeSchoolId, true);
      } else {
        return await scopedCreate('UserProgress', activeSchoolId, {
          user_email: user.email,
          lesson_id: lessonId,
          course_id: effectiveCourseId,
          notes: noteContent,
          completed: false,
          progress_percentage: 0
        }, activeSchoolId, true);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Notes saved!');
    }
  });

  // Render loading state if critical data is missing
  if (isLoading || isLoadingMeta || isLoadingCourse || (shouldLoadLesson && isLoadingLesson)) {
    return <DashboardSkeleton />;
  }

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
        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className={tokens.page.content}>
      {/* Header */}
      <div className="mb-8">
        <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
          <Button variant="ghost" className="group mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {course.title}
          </Button>
        </Link>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 shadow-xl">
          <div className="relative z-10">
            <p className="text-amber-400 font-medium mb-2 uppercase tracking-wide text-xs">{course.title}</p>
            <h1 className={cx(tokens.text.h1, "text-white mb-2")}>{lesson.title}</h1>
            {lesson.title_hebrew && (
              <h2 className="text-2xl text-amber-300 font-serif mt-2" dir="rtl">{lesson.title_hebrew}</h2>
            )}
            {access.accessLevel === 'PREVIEW' && (
              <Badge className="mt-4 bg-amber-500 hover:bg-amber-600 text-black border-none">Preview Mode</Badge>
            )}
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        </div>
      </div>

      {/* Video/Audio Player */}
      {lesson.video_url && access.accessLevel !== 'LOCKED' && (
        <div className="mb-10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/50">
          <AdvancedVideoPlayer
            src={lesson.video_url}
            onTimeUpdate={(time) => {
              // Auto-save progress
              if (progress) {
                scopedUpdate('UserProgress', progress.id, {
                  last_position_seconds: Math.floor(time)
                }, activeSchoolId, true);
              }
            }}
            onEnded={() => {
              // Auto-complete lesson when video ends
              if (!progress?.completed) {
                markCompleteMutation.mutate();
              }
            }}
            initialTime={progress?.last_position_seconds || 0}
          />
        </div>
      )}

      {lesson.audio_url && !lesson.video_url && (
        <div className="mb-10 bg-muted/30 rounded-2xl p-6 border border-border/50">
          <audio controls className="w-full" src={lesson.audio_url}>
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {/* Lesson Content */}
      {contentToShow && (
        <ProtectedContent
          policy={access.policy}
          userEmail={user?.email}
          schoolName={activeSchool?.name}
          canCopy={access.canCopy}
          canDownload={access.canDownload}
        >
          <div className={cx(tokens.glass.card, "p-8 md:p-12 mb-10")}>
            <ReactMarkdown className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-serif prose-p:leading-relaxed prose-lg">
              {contentToShow}
            </ReactMarkdown>
            {access.accessLevel === 'PREVIEW' && (
              <div className="mt-8 p-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/50 rounded-xl text-center backdrop-blur-sm">
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-4">Preview limit reached</p>
                <Link to={createPageUrl(`CourseSales?slug=${activeSchool?.slug}&courseId=${course.id}`)}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg">
                    Purchase Full Access
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </ProtectedContent>
      )}

      {/* Action Bar: Complete & Nav */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 py-8 border-t border-b border-border/40">
        <div className="w-full md:w-auto">
          {!progress?.completed ? (
            <Button
              onClick={() => markCompleteMutation.mutate()}
              disabled={markCompleteMutation.isPending}
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold h-12 px-8 text-base shadow-md hover:shadow-lg transition-all"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-6 py-3 rounded-full border border-green-200 dark:border-green-900">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">Lesson Completed</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          {previousLesson ? (
            <Link to={createPageUrl(`LessonViewer?id=${previousLesson.id}`)}>
              <Button variant="outline" className="group">
                <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" disabled className="opacity-50">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}

          {nextLesson ? (
            <Link to={createPageUrl(`LessonViewer?id=${nextLesson.id}`)}>
              <Button className="group bg-primary text-primary-foreground hover:bg-primary/90">
                Next Lesson
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Finish Course
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="mb-10">
        <h3 className={cx(tokens.text.h3, "mb-6")}>Discussion</h3>
        <div className={tokens.glass.card}>
          <div className="p-6">
            <DiscussionThread
              discussions={discussions || []}
              courseId={effectiveCourseId}
              lessonId={lessonId}
              user={user}
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mb-20">
        <h3 className={cx(tokens.text.h3, "mb-6")}>Personal Notes</h3>
        <div className={tokens.glass.card}>
          <div className="p-6">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Capture your insights..."
              className="min-h-[150px] mb-4 bg-background/50 border-border/50 focus:bg-background transition-colors resize-y"
            />
            <div className="flex justify-end">
              <Button 
                onClick={() => saveNotesMutation.mutate(notes)}
                variant="outline"
                disabled={saveNotesMutation.isPending}
              >
                Save Notes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}