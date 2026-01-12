import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { useSession } from '@/components/hooks/useSession';
import { base44 } from '@/api/base44Client';
import { tokens, cx } from '@/components/theme/tokens';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  CheckSquare, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  User, 
  Award,
  Download,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeachGrading() {
  const { user, activeSchoolId } = useSession();
  const queryClient = useQueryClient();
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [downloadingKey, setDownloadingKey] = useState('');

  const formatFileSize = (size) => {
    if (!Number.isFinite(size)) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async (attachment) => {
    if (!attachment?.key || !activeSchoolId) return;
    setDownloadingKey(attachment.key);
    try {
      const presign = await base44.request('/media/r2/presign', {
        method: 'POST',
        body: {
          school_id: activeSchoolId,
          key: attachment.key,
          method: 'GET',
        },
      });
      window.open(presign.url, '_blank', 'noopener');
    } catch (error) {
      toast.error('Unable to download attachment');
    } finally {
      setDownloadingKey('');
    }
  };

  // 1. Fetch courses taught by this instructor
  const { data: myCourses = [] } = useQuery({
    queryKey: ['teacher-courses', user?.email, activeSchoolId],
    queryFn: async () => {
      // Logic from TeachAnalytics: courses created by user OR where they are staff
      const created = await scopedFilter('Course', activeSchoolId, {
        created_by: user.email
      });
      const staffRecords = await scopedFilter('CourseStaff', activeSchoolId, {
        user_email: user.email
      });
      const staffCourseIds = staffRecords.map(s => s.course_id);
      const staffCourses = [];
      for (const id of staffCourseIds) {
        const courses = await scopedFilter('Course', activeSchoolId, { id });
        if (courses.length > 0) staffCourses.push(courses[0]);
      }
      const allCourses = [...created, ...staffCourses];
      return Array.from(new Map(allCourses.map(c => [c.id, c])).values());
    },
    enabled: !!user && !!activeSchoolId
  });

  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  // 2. Fetch submissions for these courses
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['course-submissions', activeSchoolId, myCourseIds],
    queryFn: async () => {
      if (myCourseIds.length === 0) return [];
      // Fetch submissions for my courses
      return await scopedFilter('Submission', activeSchoolId, {
        course_id: { $in: myCourseIds }
      }, '-created_date', 500);
    },
    enabled: !!activeSchoolId && myCourseIds.length > 0
  });

  const selectedSubmission = useMemo(() => 
    submissions.find(s => s.id === selectedSubmissionId),
    [submissions, selectedSubmissionId]
  );

  const gradeMutation = useMutation({
    mutationFn: async ({ id, score, feedback }) => {
      return await scopedUpdate('Submission', id, {
        status: 'GRADED',
        score: parseFloat(score),
        feedback,
        graded_at: new Date().toISOString(),
        graded_by: user.email
      }, activeSchoolId, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['course-submissions']);
      toast.success('Submission graded successfully');
      setSelectedSubmissionId(null);
      setGradeValue('');
      setFeedback('');
    },
    onError: (err) => {
      toast.error('Grading failed: ' + err.message);
    }
  });

  const pendingSubmissions = submissions.filter(s => s.status === 'PENDING');
  const gradedSubmissions = submissions.filter(s => s.status === 'GRADED');

  return (
    <div className={tokens.layout.sectionGap}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={tokens.text.h1}>Grading & Submissions</h1>
          <p className={tokens.text.lead}>Review and grade student assignments across your courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <Clock className="w-3.5 h-3.5 mr-2 text-amber-500" />
            {pendingSubmissions.length} Pending
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Submission List */}
        <div className="lg:col-span-4 space-y-4">
          <Card className={cx(tokens.glass.card, "h-[calc(100vh-250px)] overflow-hidden flex flex-col")}>
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Submissions</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search students..." className="pl-9 h-9" />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1">
              <Tabs defaultValue="pending" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
                  <TabsTrigger value="pending" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="graded" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                    Graded
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="m-0">
                  {pendingSubmissions.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {pendingSubmissions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSubmissionId(s.id)}
                          className={cx(
                            "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group",
                            selectedSubmissionId === s.id && "bg-primary/5 border-l-4 border-primary"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{s.user_email}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <FileText className="w-3 h-3" />
                              {myCourses.find(c => c.id === s.course_id)?.title || 'Course'}
                            </div>
                            <div className="text-[10px] mt-1 text-slate-400">
                              {new Date(s.created_date).toLocaleDateString()}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="graded" className="m-0">
                   <div className="divide-y">
                      {gradedSubmissions.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSubmissionId(s.id)}
                          className={cx(
                            "w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-center justify-between group",
                            selectedSubmissionId === s.id && "bg-primary/5 border-l-4 border-primary"
                          )}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{s.user_email}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Award className="w-3 h-3 text-green-500" />
                              Score: {s.score}%
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      ))}
                    </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main View: Grading Interface */}
        <div className="lg:col-span-8">
          {selectedSubmission ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Card className={tokens.glass.card}>
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 capitalize">
                        {selectedSubmission.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Submitted on {new Date(selectedSubmission.created_date).toLocaleString()}</span>
                    </div>
                    <CardTitle className="text-2xl">{selectedSubmission.user_email}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <BookOpen className="w-4 h-4" />
                      {myCourses.find(c => c.id === selectedSubmission.course_id)?.title || 'Course Content'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">View History</Button>
                    <Button variant="outline" size="sm">Contact Student</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Submission Content</h4>
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                      {selectedSubmission.content || (
                        <div className="flex items-center gap-3 text-amber-600">
                          <AlertCircle className="w-5 h-5" />
                          <span>No text content provided. Check attachments.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {Array.isArray(selectedSubmission.attachments) && selectedSubmission.attachments.length > 0 && (
                    <div className="space-y-3">
                       <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Attachments</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {selectedSubmission.attachments.map((file, idx) => (
                           <div key={file.key || idx} className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                             <div className="flex items-center gap-3 min-w-0">
                               <FileText className="w-8 h-8 text-blue-500" />
                               <div className="min-w-0">
                                 <p className="text-sm font-medium truncate">{file.name || 'Attachment'}</p>
                                 <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                               </div>
                             </div>
                             <Button
                               variant="ghost"
                               size="icon"
                               onClick={() => handleDownload(file)}
                               disabled={!file.key || downloadingKey === file.key}
                             >
                               <Download className="w-4 h-4" />
                             </Button>
                           </div>
                         ))}
                       </div>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-4 pt-4">
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Grading & Feedback
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="grade">Score (%)</Label>
                        <Input 
                          id="grade"
                          type="number" 
                          placeholder="0-100" 
                          value={gradeValue}
                          onChange={(e) => setGradeValue(e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-3 space-y-2">
                        <Label htmlFor="feedback">Feedback to Student</Label>
                        <Textarea 
                          id="feedback"
                          placeholder="Provide constructive feedback..." 
                          rows={4}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="ghost" onClick={() => setSelectedSubmissionId(null)}>Cancel</Button>
                      <Button 
                        disabled={!gradeValue || gradeMutation.isPending}
                        onClick={() => gradeMutation.mutate({
                          id: selectedSubmission.id,
                          score: gradeValue,
                          feedback
                        })}
                        className="min-w-[120px]"
                      >
                        {gradeMutation.isPending ? 'Saving...' : 'Post Grade'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-[calc(100vh-250px)] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-2xl opacity-50">
              <div className="bg-muted rounded-full p-8 mb-6">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-slate-400">Select a submission to begin grading</h3>
              <p className="text-slate-400 max-w-sm mt-2">
                Click on a student's name from the list on the left to review their work and provide feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-slate-200 dark:bg-slate-800 w-full" />;
}
