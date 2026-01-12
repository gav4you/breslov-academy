import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '@/components/hooks/useSession';
import { scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'he', label: 'Hebrew' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'ru', label: 'Russian' }
];

export default function TeachLesson() {
  const { user, activeSchoolId } = useSession();
  const [lessonId, setLessonId] = useState(null);
  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoStreamId, setVideoStreamId] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [lessonLanguage, setLessonLanguage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLessonId(params.get('id'));
  }, []);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId, activeSchoolId],
    queryFn: async () => {
      const lessons = await scopedFilter('Lesson', activeSchoolId, { id: lessonId });
      const l = lessons[0];
      if (l) {
        setContent(l.content || '');
        setVideoUrl(l.video_url || '');
        setVideoStreamId(l.video_stream_id || '');
        setAudioUrl(l.audio_url || '');
        setLessonLanguage(l.language || '');
      }
      return l;
    },
    enabled: !!lessonId && !!activeSchoolId
  });

  const { data: course } = useQuery({
    queryKey: ['course', lesson?.course_id, activeSchoolId],
    queryFn: async () => {
      const courses = await scopedFilter('Course', activeSchoolId, { id: lesson.course_id });
      return courses[0];
    },
    enabled: !!lesson && !!activeSchoolId
  });

  useEffect(() => {
    if (!lessonLanguage && course?.language) {
      setLessonLanguage(course.language);
    }
  }, [lessonLanguage, course?.language]);

  const updateLessonMutation = useMutation({
    mutationFn: ({ data }) => scopedUpdate('Lesson', lessonId, data, activeSchoolId, true),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['lesson']);
      toast.success('Lesson saved!');
      if (variables?.audit) {
        scopedCreate('AuditLog', activeSchoolId, {
          school_id: activeSchoolId,
          user_email: user?.email,
          action: variables.audit.action,
          entity_type: variables.audit.entity_type,
          entity_id: variables.audit.entity_id,
          metadata: variables.audit.metadata
        }).catch(() => {});
      }
    }
  });

  const handleSave = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const effectiveLanguage = lessonLanguage || course?.language || 'en';
    
    updateLessonMutation.mutate({
      data: {
        title: formData.get('title'),
        content,
        video_url: videoUrl || formData.get('video_url'),
        video_stream_id: videoStreamId || null,
        audio_url: audioUrl || formData.get('audio_url'),
        language: effectiveLanguage,
        duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
        drip_days_after_enroll: parseInt(formData.get('drip_days_after_enroll')) || null
      }
    });
  };

  const handleStreamUpload = async (file) => {
    if (!file || !activeSchoolId || !lessonId) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const session = await base44.request('/media/stream/create', {
        method: 'POST',
        body: {
          school_id: activeSchoolId,
          lesson_id: lessonId,
          course_id: lesson?.course_id || null,
        },
      });

      const formData = new FormData();
      formData.append('file', file, file.name);
      const uploadResponse = await fetch(session.upload_url, {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const streamUrl = `https://videodelivery.net/${session.stream_uid}/downloads/default.mp4`;
      setVideoUrl(streamUrl);
      setVideoStreamId(session.stream_uid);

      await scopedUpdate('Lesson', lessonId, {
        video_url: streamUrl,
        video_stream_id: session.stream_uid,
      }, activeSchoolId, true);

      toast.success('Video uploaded successfully');
    } catch (error) {
      setUploadError('Video upload failed. Please try again.');
      toast.error('Video upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleStatus = () => {
    const newStatus = lesson.status === 'draft' ? 'published' : 'draft';
    updateLessonMutation.mutate({
      data: { status: newStatus },
      audit: {
        action: newStatus === 'published' ? 'PUBLISH_LESSON' : 'UNPUBLISH_LESSON',
        entity_type: 'Lesson',
        entity_id: lesson.id,
        metadata: { status: newStatus }
      }
    });
  };

  if (isLoading || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(createPageUrl(`TeachCourse?id=${lesson.course_id}`))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
            <p className="text-sm text-slate-600">{course?.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
            {lesson.status}
          </Badge>
          <Button variant="outline" onClick={toggleStatus}>
            {lesson.status === 'draft' ? 'Publish' : 'Unpublish'}
          </Button>
          <Button 
            variant="ghost"
            onClick={() => window.open(createPageUrl(`LessonViewer?id=${lesson.id}`), '_blank')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor */}
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input name="title" defaultValue={lesson.title} required />
            </div>

            <div className="space-y-2">
              <Label>Lesson Language</Label>
              <Select value={lessonLanguage || course?.language || 'en'} onValueChange={setLessonLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                className="min-h-[300px] resize-y"
                placeholder="Write lesson content (Markdown supported)."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input
                  name="video_url"
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Audio URL</Label>
                <Input
                  name="audio_url"
                  value={audioUrl}
                  onChange={(event) => setAudioUrl(event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-border/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Upload via Cloudflare Stream</p>
                  <p className="text-xs text-muted-foreground">Direct upload to secure video hosting.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleStreamUpload(file);
                      event.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Select video'}
                  </Button>
                </div>
              </div>
              {uploadError && (
                <p className="mt-2 text-xs text-destructive">{uploadError}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input name="duration_minutes" type="number" defaultValue={lesson.duration_minutes} />
              </div>
              {course?.drip_enabled && (
                <div className="space-y-2">
                  <Label>Drip: Days After Enrollment</Label>
                  <Input 
                    name="drip_days_after_enroll" 
                    type="number" 
                    defaultValue={lesson.drip_days_after_enroll}
                    placeholder="0 = immediate"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Save Lesson
        </Button>
      </form>
    </div>
  );
}
