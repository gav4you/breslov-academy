import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Clock, Crown, Play, Lock, CheckCircle, BookOpen, ClipboardCheck, AlertCircle } from 'lucide-react';

import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { scopedFilter } from '@/components/api/scoped';
import { getRawEntity } from '@/components/api/tenancyEnforcer';
import { useSession } from '@/components/hooks/useSession';
import { isEntitlementActive } from '@/components/utils/entitlements';
import { toast } from '@/components/ui/use-toast';
import { tokens, cx } from '@/components/theme/tokens';

function uniqStrings(list) {
  const out = [];
  const seen = new Set();
  for (const v of list || []) {
    const s = String(v || '');
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function getCourseIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function accessForQuiz({ quiz, isTeacher, hasCourseAccess }) {
  if (isTeacher) return 'FULL';
  if (hasCourseAccess) return 'FULL';
  const previewLimit = Number(quiz?.preview_limit_questions || 0);
  return previewLimit > 0 ? 'PREVIEW' : 'LOCKED';
}

export default function CourseDetail() {
  const courseId = getCourseIdFromUrl();
  const { user, memberships, activeSchoolId, changeActiveSchool, role, isTeacher, isLoading } = useSession();

  const canTeach = !!isTeacher;

  // Resolve course across schools the user belongs to (handles deep links even when active school differs).
  const { data: resolvedCourse, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course-resolve', courseId, user?.email, activeSchoolId, (memberships || []).length],
    queryFn: async () => {
      if (!courseId || !user?.email) return null;

      const candidateSchoolIds = uniqStrings([
        activeSchoolId,
        ...(memberships || []).map((m) => m.school_id),
      ]);

      const rawCourse = getRawEntity(base44, 'Course');
      if (!rawCourse?.filter) return null;

      for (const sid of candidateSchoolIds) {
        try {
          const rows = await rawCourse.filter({ id: courseId, school_id: sid }, '-created_date', 1);
          if (rows?.[0]) {
            return { course: rows[0], schoolId: sid };
          }
        } catch {
          // continue
        }
      }

      return null;
    },
    enabled: !!courseId && !!user?.email && !isLoading,
  });

  const course = resolvedCourse?.course || null;
  const courseSchoolId = resolvedCourse?.schoolId || course?.school_id || null;

  // If this course belongs to a different school, switch the active school so the rest
  // of the app (tenancy enforcer, scoped queries) behaves consistently.
  useEffect(() => {
    if (!courseSchoolId) return;
    if (!activeSchoolId) return;
    if (String(courseSchoolId) === String(activeSchoolId)) return;

    // Only switch if the user is actually a member of the course's school.
    const ok = (memberships || []).some((m) => String(m.school_id) === String(courseSchoolId));
    if (!ok) return;

    changeActiveSchool(courseSchoolId)
      .then(() => {
        toast({
          title: 'Switched active school',
          description: 'We switched your active school to match this course.',
        });
      })
      .catch(() => {
        // ignore
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSchoolId]);

  const effectiveRole = useMemo(() => {
    if (!courseSchoolId) return role;
    const m = (memberships || []).find((x) => String(x.school_id) === String(courseSchoolId));
    return m?.role || role;
  }, [memberships, courseSchoolId, role]);

  // Legacy subscription tier (kept for backward compatibility)
  const { data: subscription } = useQuery({
    queryKey: ['subscription-legacy', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const subs = await scopedFilter('Subscription', activeSchoolId, { user_email: user.email }, '-created_date', 1);
        return subs?.[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!user?.email,
  });

  const userTier = String(subscription?.tier || 'free').toLowerCase();

  // Entitlements for the course school (modern access path)
  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', courseSchoolId, user?.email],
    queryFn: () => scopedFilter('Entitlement', courseSchoolId, { user_email: user.email }, '-created_date', 500),
    enabled: !!courseSchoolId && !!user?.email && !isTeacher,
  });

  const activeEntitlements = useMemo(() => (entitlements || []).filter((e) => isEntitlementActive(e)), [entitlements]);

  const hasEntitledCourseAccess = useMemo(() => {
    if (!course) return false;
    if (['OWNER', 'ADMIN', 'INSTRUCTOR', 'TA'].includes(String(effectiveRole || '').toUpperCase())) return true;

    // Modern access_level model
    if (String(course.access_level || '').toUpperCase() === 'FREE') return true;
    if (['PAID', 'PRIVATE'].includes(String(course.access_level || '').toUpperCase())) {
      const cid = String(course.id);
      const has = (activeEntitlements || []).some((e) => {
        const t = e.type || e.entitlement_type;
        if (t === 'ALL_COURSES') return true;
        if (t === 'COURSE' && String(e.course_id) === cid) return true;
        return false;
      });
      return has;
    }

    return false;
  }, [course, effectiveRole, activeEntitlements]);

  const hasTierAccess = useMemo(() => {
    if (!course) return false;
    const tier = String(course.access_tier || 'free').toLowerCase();
    if (tier === 'free') return true;
    if (tier === 'premium') return ['premium', 'elite'].includes(userTier);
    if (tier === 'elite') return userTier === 'elite';
    return false;
  }, [course, userTier]);

  const hasCourseAccess = !!(hasEntitledCourseAccess || hasTierAccess);

  const { data: lessons = [] } = useQuery({
    queryKey: ['lessons', courseSchoolId, courseId],
    queryFn: () => scopedFilter('Lesson', courseSchoolId, { course_id: courseId }, 'order', 1000),
    enabled: !!courseSchoolId && !!courseId,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['progress', courseSchoolId, user?.email, courseId],
    queryFn: () => scopedFilter('UserProgress', courseSchoolId, { user_email: user.email, course_id: courseId }, '-created_date', 1000),
    enabled: !!courseSchoolId && !!user?.email && !!courseId,
  });

  const completedLessons = progress.filter((p) => p.completed).length;
  const progressPercentage = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;
  const courseCompleted = progressPercentage === 100 && lessons.length > 0;

  const { data: certificate } = useQuery({
    queryKey: ['certificate', courseSchoolId, user?.email, courseId],
    queryFn: async () => {
      const certs = await scopedFilter('Certificate', courseSchoolId, { user_email: user.email, course_id: courseId }, '-created_date', 1);
      return certs?.[0] || null;
    },
    enabled: !!courseSchoolId && !!user?.email && !!courseId && courseCompleted,
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ['quizzes-for-course', courseSchoolId, courseId, canTeach],
    queryFn: () => {
      const base = { course_id: courseId };
      const filters = canTeach ? base : { ...base, is_published: true };
      return scopedFilter('Quiz', courseSchoolId, filters, '-created_date', 250);
    },
    enabled: !!courseSchoolId && !!courseId,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ['quiz-attempts', courseSchoolId, user?.email],
    queryFn: () => scopedFilter('QuizAttempt', courseSchoolId, { user_email: user.email }, '-created_date', 250),
    enabled: !!courseSchoolId && !!user?.email && !isTeacher,
  });

  const lastAttemptByQuizId = useMemo(() => {
    const m = new Map();
    (quizAttempts || []).forEach((a) => {
      const qid = String(a.quiz_id || '');
      if (!qid) return;
      if (!m.has(qid)) m.set(qid, a);
    });
    return m;
  }, [quizAttempts]);

  const getLessonStatus = (lesson) => {
    const lessonProgress = progress.find((p) => p.lesson_id === lesson.id);
    return lessonProgress?.completed ? 'completed' : lessonProgress ? 'in-progress' : 'not-started';
  };

  if (isLoading || isLoadingCourse) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading course data...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-muted rounded-full p-6 mb-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          This course may have been removed or you may not have permission to view it.
        </p>
        <Link to={createPageUrl('Courses')}>
          <Button variant="outline" size="lg">Return to Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={tokens.layout.sectionGap}>
      {/* Back Button */}
      <Link to={createPageUrl('Courses')}>
        <Button variant="ghost" className="group pl-0 hover:pl-2 transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </Link>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
        {/* Background Gradient/Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 md:items-start">
            
            {/* Left Column: Info */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-primary-foreground border-none hover:bg-primary/90">
                  {course.category?.replace(/_/g, ' ') || 'General'}
                </Badge>
                <Badge variant="outline" className="text-slate-300 border-slate-700">
                  {course.level}
                </Badge>
                {!hasCourseAccess && course.access_tier !== 'free' && (
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    <Crown className="w-3 h-3 mr-1" />
                    {course.access_tier}
                  </Badge>
                )}
              </div>

              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                  {course.title}
                </h1>
                {course.title_hebrew && (
                  <h2 className="text-2xl text-amber-400/90 font-serif mt-2" dir="rtl">
                    {course.title_hebrew}
                  </h2>
                )}
              </div>

              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-6 text-sm font-medium text-slate-400 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-full">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>{course.instructor}</span>
                </div>
                {course.duration_hours && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-800 rounded-full">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span>{course.duration_hours}h content</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-full">
                    <Play className="w-4 h-4" />
                  </div>
                  <span>{lessons.length} lessons</span>
                </div>
              </div>
            </div>

            {/* Right Column: Progress / CTA */}
            <div className="w-full md:w-80 shrink-0">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-white">
                <CardContent className="p-6">
                  {hasCourseAccess ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-4 ring-1 ring-green-500/40">
                          <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Course Active</h3>
                        <p className="text-sm text-slate-400">You have full access</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-slate-400">
                          <span>Progress</span>
                          <span>{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2 bg-slate-800" />
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" asChild>
                          <Link to={createPageUrl(`LessonViewer?id=${lessons[0]?.id}`)}>
                            {progressPercentage > 0 ? 'Resume Learning' : 'Start Course'}
                          </Link>
                        </Button>
                        {courseCompleted && certificate && (
                          <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white" onClick={() => window.open(createPageUrl(`CertificateVerify?certificateId=${certificate.certificate_id}`), '_blank')}>
                            View Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mb-4 ring-1 ring-amber-500/40">
                        <Lock className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Unlock Access</h3>
                        <p className="text-sm text-slate-400">Enroll to start learning</p>
                      </div>
                      <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold" size="lg" asChild>
                        <Link to={createPageUrl('Subscription')}>
                          Get Access Now
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Curriculum */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Lessons List */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
              <span className="text-sm text-muted-foreground">{lessons.length} lessons</span>
            </div>

            <div className="space-y-3">
              {lessons.length > 0 ? lessons.map((lesson, index) => {
                const status = getLessonStatus(lesson);
                const canAccess = hasCourseAccess || lesson.is_preview;
                
                return (
                  <Link 
                    key={lesson.id}
                    to={canAccess ? createPageUrl(`LessonViewerPremium?id=${lesson.id}`) : '#'}
                    onClick={(e) => !canAccess && e.preventDefault()}
                    className={`block group relative overflow-hidden rounded-xl border transition-all duration-300 ${
                      canAccess 
                        ? 'bg-card hover:border-primary/50 hover:shadow-md' 
                        : 'bg-muted/30 border-transparent opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="p-5 flex items-start gap-4">
                      {/* Status Icon */}
                      <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        canAccess ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' :
                        'bg-slate-100 text-slate-400 dark:bg-slate-800'
                      }`}>
                        {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : 
                         canAccess ? <Play className="w-4 h-4 ml-0.5" /> : 
                         <Lock className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Lesson {index + 1}
                          </span>
                          {lesson.is_preview && !hasCourseAccess && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none text-[10px] px-2 h-5">
                              Free Preview
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className={`text-lg font-semibold mb-1 truncate ${canAccess ? 'group-hover:text-primary' : ''}`}>
                          {lesson.title}
                        </h3>
                        
                        {lesson.title_hebrew && (
                          <p className="text-base text-primary/80 font-serif mb-2" dir="rtl">
                            {lesson.title_hebrew}
                          </p>
                        )}

                        {lesson.duration_minutes && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{lesson.duration_minutes} mins</span>
                          </div>
                        )}
                      </div>

                      {status === 'completed' && (
                        <div className="self-center">
                          <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:bg-green-900/10 dark:border-green-800 dark:text-green-400">
                            Completed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              }) : (
                <div className="text-center py-12 bg-muted/30 rounded-xl border-2 border-dashed border-border">
                  <p className="text-muted-foreground">No lessons available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Quizzes & Extras */}
        <div className="space-y-8">
          
          {/* Quizzes */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <ClipboardCheck className="w-5 h-5 mr-2 text-primary" />
              Assessments
            </h3>
            
            <div className="space-y-3">
              {quizzes.length > 0 ? quizzes.map((quiz) => {
                const access = accessForQuiz({ quiz, isTeacher: canTeach, hasCourseAccess });
                const last = lastAttemptByQuizId.get(String(quiz.id));
                const score = last ? Number(last.score || 0) : null;

                return (
                  <Card key={quiz.id} className={`border-none shadow-sm ${access === 'LOCKED' ? 'bg-muted/50' : 'bg-card'}`}>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm line-clamp-1">{quiz.title}</h4>
                          {access === 'LOCKED' && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        {score !== null && (
                          <div className="text-xs text-muted-foreground">
                            Best Score: <span className={score >= 80 ? 'text-green-600 font-bold' : ''}>{score}%</span>
                          </div>
                        )}
                      </div>
                      
                      {access !== 'LOCKED' ? (
                        <Button size="sm" variant="outline" className="w-full h-8 text-xs" asChild>
                          <Link to={`/quiz/${quiz.id}`}>
                            {score !== null ? 'Retake Quiz' : 'Start Quiz'}
                          </Link>
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="w-full h-8 text-xs bg-muted text-muted-foreground">
                          Locked
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              }) : (
                <p className="text-sm text-muted-foreground italic">No quizzes for this course.</p>
              )}
            </div>
          </div>

          {/* Teacher Tools */}
          {canTeach && (
            <Card className="bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-indigo-900 dark:text-indigo-300">Instructor Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link to={`/teach/quizzes?courseId=${courseId}`}>Manage Quizzes</Link>
                </Button>
                <Button size="sm" variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-100" asChild>
                  <Link to={`/teach/analytics?courseId=${courseId}`}>View Analytics</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
