import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, CheckCircle, Maximize2, Minimize2, LayoutGrid, 
  Users, FileText, MessageSquare, BookOpen, Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import VideoPlayer from '../components/video/VideoPlayer';
import ChavrutaAI from '../components/learning/ChavrutaAI';
import SourceTextPanel from '../components/learning/SourceTextPanel';
import StudyNotebook from '../components/learning/StudyNotebook';
import DiscussionThread from '../components/learning/DiscussionThread';

export default function LessonViewer() {
  const [user, setUser] = useState(null);
  const [layout, setLayout] = useState('theater');
  const [activePanel, setActivePanel] = useState('video');
  const [fullscreen, setFullscreen] = useState(false);
  
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId = urlParams.get('id');

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

  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson?.course_id
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ['lessons', lesson?.course_id],
    queryFn: () => base44.entities.Lesson.filter({ course_id: lesson.course_id }, 'order'),
    enabled: !!lesson?.course_id
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', user?.email, lessonId],
    queryFn: async () => {
      const progs = await base44.entities.UserProgress.filter({ 
        user_email: user.email,
        lesson_id: lessonId 
      });
      return progs[0];
    },
    enabled: !!user?.email && !!lessonId
  });

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', lesson?.course_id, lessonId],
    queryFn: () => base44.entities.Discussion.filter({ 
      course_id: lesson.course_id,
      lesson_id: lessonId 
    }, '-created_date'),
    enabled: !!lesson?.course_id
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (progress) {
        return await base44.entities.UserProgress.update(progress.id, {
          completed: true,
          progress_percentage: 100
        });
      } else {
        return await base44.entities.UserProgress.create({
          user_email: user.email,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completed: true,
          progress_percentage: 100
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Lesson completed! 🎉');
    }
  });

  const saveNotesMutation = useMutation({
    mutationFn: async (noteData) => {
      if (progress) {
        return await base44.entities.UserProgress.update(progress.id, { notes: noteData });
      } else {
        return await base44.entities.UserProgress.create({
          user_email: user.email,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          notes: noteData,
          completed: false,
          progress_percentage: 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['progress']);
      toast.success('Notes saved');
    }
  });

  if (!lesson || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-slate-400 animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 font-serif">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const sourceText = {
    hebrew: lesson.content_hebrew,
    english: lesson.content,
    commentary: lesson.instructor_notes
  };

  const renderPanel = (panel) => {
    switch(panel) {
      case 'video':
        return lesson.video_url ? (
          <VideoPlayer
            src={lesson.video_url}
            onTimeUpdate={(time) => {
              if (progress) {
                base44.entities.UserProgress.update(progress.id, {
                  last_position_seconds: Math.floor(time)
                });
              }
            }}
            onEnded={() => {
              if (!progress?.completed) {
                markCompleteMutation.mutate();
              }
            }}
            initialTime={progress?.last_position_seconds || 0}
            bookmarks={lesson.bookmarks || []}
            transcript={lesson.transcript || []}
          />
        ) : (
          <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center">
            <p className="text-white font-serif">No video available</p>
          </div>
        );
      case 'text':
        return (
          <SourceTextPanel
            sourceText={sourceText}
            onAnnotate={(text) => console.log('Annotate:', text)}
            onDiscuss={(text) => console.log('Discuss:', text)}
          />
        );
      case 'notes':
        return (
          <StudyNotebook
            lessonId={lessonId}
            userEmail={user?.email}
            notes={progress?.notes}
            onSave={(noteData) => saveNotesMutation.mutate(noteData)}
          />
        );
      case 'chavruta':
        return (
          <ChavrutaAI
            lessonId={lessonId}
            sourceText={sourceText?.english || lesson?.content}
          />
        );
      case 'discussion':
        return (
          <div className="bg-white rounded-2xl h-full overflow-y-auto">
            <DiscussionThread
              discussions={discussions || []}
              courseId={lesson.course_id}
              lessonId={lessonId}
              user={user}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'bg-slate-50'}`}>
      {/* Premium Academic Header */}
      <div className={`border-b border-slate-200 bg-white/95 backdrop-blur-sm ${fullscreen ? 'hidden' : ''}`}>
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                <Button variant="ghost" size="sm" className="rounded-lg font-serif">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Course
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 font-serif">{lesson.title}</h1>
                {lesson.title_hebrew && (
                  <p className="text-sm text-amber-700 font-serif" dir="rtl">{lesson.title_hebrew}</p>
                )}
              </div>
            </div>

            {/* Layout Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={layout === 'theater' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayout('theater')}
                className="rounded-lg"
                title="Theater Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button
                variant={layout === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLayout('split')}
                className="rounded-lg"
                title="Split View"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
                className="rounded-lg"
              >
                {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Learning Interface */}
      <div className={`${fullscreen ? 'h-screen' : 'min-h-screen'}`}>
        {layout === 'theater' && (
          <div className="max-w-[1400px] mx-auto p-6 space-y-6">
            {/* Primary Content Area */}
            <div className="rounded-2xl overflow-hidden premium-shadow-xl">
              {renderPanel(activePanel)}
            </div>

            {/* Torah Study Palette - Beis Medrash Style */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {[
                { id: 'video', label: 'Shiur Video', icon: Maximize2, enabled: !!lesson.video_url },
                { id: 'text', label: 'Mekor (Source)', icon: BookOpen, enabled: !!(sourceText?.hebrew || sourceText?.english) },
                { id: 'notes', label: 'Chidushim', icon: FileText, enabled: true },
                { id: 'chavruta', label: 'Chavruta AI', icon: Users, enabled: true },
                { id: 'discussion', label: 'Beis Medrash', icon: MessageSquare, enabled: true }
              ].filter(t => t.enabled).map(tool => {
                const Icon = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    onClick={() => setActivePanel(tool.id)}
                    variant={activePanel === tool.id ? 'default' : 'outline'}
                    className={`rounded-xl font-serif transition-all ${
                      activePanel === tool.id 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg scale-105' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tool.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {layout === 'split' && (
          <div className="h-full grid grid-cols-2 gap-4 p-6 max-w-[1800px] mx-auto">
            {/* Left Panel - Primary Learning */}
            <div className="space-y-4">
              {lesson.video_url ? renderPanel('video') : renderPanel('text')}
              
              {/* Quick Access Tools */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setActivePanel('chavruta')}
                  variant="outline"
                  className="rounded-xl font-serif hover:scale-105 transition-transform"
                >
                  <Users className="w-4 h-4 mr-2" />
                  AI Chavrusa
                </Button>
                <Button
                  onClick={() => setActivePanel('discussion')}
                  variant="outline"
                  className="rounded-xl font-serif hover:scale-105 transition-transform"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Beis Medrash
                </Button>
              </div>
            </div>

            {/* Right Panel - Study Materials */}
            <div className="grid grid-rows-2 gap-4 h-[calc(100vh-120px)]">
              {lesson.video_url ? renderPanel('text') : renderPanel('video')}
              {renderPanel('notes')}
            </div>
          </div>
        )}
      </div>

      {/* Academic Progress Footer */}
      {!fullscreen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm sticky bottom-0">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {!progress?.completed ? (
                  <Button
                    onClick={() => markCompleteMutation.mutate()}
                    className="bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl font-serif hover:shadow-lg transition-shadow"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-serif font-bold">Completed</span>
                  </div>
                )}
              </div>

              {/* Lesson Navigation */}
              <div className="flex items-center gap-3">
                {previousLesson && (
                  <Link to={createPageUrl(`LessonViewer?id=${previousLesson.id}`)}>
                    <Button variant="outline" size="sm" className="rounded-lg font-serif">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-slate-600 font-serif">
                  Lesson {currentIndex + 1} of {allLessons.length}
                </span>
                {nextLesson ? (
                  <Link to={createPageUrl(`LessonViewer?id=${nextLesson.id}`)}>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg font-serif">
                      Next Lesson
                      <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPageUrl(`CourseDetail?id=${course.id}`)}>
                    <Button size="sm" className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-serif">
                      Course Complete
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}