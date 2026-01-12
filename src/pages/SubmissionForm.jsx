// src/pages/SubmissionForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import PageShell from '@/components/ui/PageShell';
import { useSession } from '@/components/hooks/useSession';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scopedFilter, scopedCreate, scopedUpdate } from '@/components/api/scoped';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Save, ArrowLeft, AlertCircle, Paperclip, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function SubmissionForm() {
  const { user, activeSchoolId, isLoading: isSessionLoading } = useSession();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const existingSubmissionId = searchParams.get('id');
  const assignmentId = searchParams.get('assignmentId'); // If creating a new submission for an assignment

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [downloadingKey, setDownloadingKey] = useState('');
  const uploadBucketRef = useRef(
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  const fileInputRef = useRef(null);

  const normalizeEmailForKey = (email) => {
    return String(email || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const sanitizeFileName = (name) => {
    return String(name || 'attachment')
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const formatFileSize = (size) => {
    if (!Number.isFinite(size)) return 'Unknown size';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const buildAttachmentKey = (fileName) => {
    const safeEmail = normalizeEmailForKey(user?.email);
    const bucketId = existingSubmissionId || uploadBucketRef.current;
    const safeName = sanitizeFileName(fileName);
    return `schools/${activeSchoolId}/submissions/${safeEmail}/${bucketId}/${Date.now()}-${safeName}`;
  };

  const { data: existingSubmission, isLoading: isLoadingExistingSubmission } = useQuery({
    queryKey: ['submission', existingSubmissionId, activeSchoolId, user?.email],
    queryFn: async () => {
      if (!existingSubmissionId || !activeSchoolId || !user?.email) return null;
      const submissions = await scopedFilter('Submission', activeSchoolId, {
        id: existingSubmissionId,
        user_email: user.email,
      });
      return submissions[0] || null;
    },
    enabled: !!existingSubmissionId && !!activeSchoolId && !!user?.email,
  });

  useEffect(() => {
    if (existingSubmission) {
      setTitle(existingSubmission.title || '');
      setContent(existingSubmission.content || '');
      if (Array.isArray(existingSubmission.attachments)) {
        setAttachments(existingSubmission.attachments);
      } else if (typeof existingSubmission.attachments === 'string') {
        try {
          const parsed = JSON.parse(existingSubmission.attachments);
          setAttachments(Array.isArray(parsed) ? parsed : []);
        } catch {
          setAttachments([]);
        }
      } else {
        setAttachments([]);
      }
    } else if (assignmentId) {
      // Potentially fetch assignment details here to pre-fill title or instructions
      setTitle(`Submission for Assignment ${assignmentId}`); // Placeholder
    }
  }, [existingSubmission, assignmentId]);

  const createSubmissionMutation = useMutation({
    mutationFn: (newSubmission) => scopedCreate('Submission', activeSchoolId, {
      ...newSubmission,
      school_id: activeSchoolId,
      user_email: user.email,
      status: 'PENDING',
      created_by: user.email,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['my-submissions']);
      toast.success('Submission created successfully!');
      navigate(createPageUrl(`AssignmentDetail?id=${data.id}`));
    },
    onError: (err) => {
      toast.error('Failed to create submission: ' + err.message);
    }
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: (updatedSubmission) => scopedUpdate('Submission', existingSubmissionId, updatedSubmission, activeSchoolId, true),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['my-submissions']);
      toast.success('Submission updated successfully!');
      navigate(createPageUrl(`AssignmentDetail?id=${data.id}`));
    },
    onError: (err) => {
      toast.error('Failed to update submission: ' + err.message);
    }
  });

  const uploadAttachment = async (file) => {
    if (!file || !activeSchoolId || !user?.email) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const key = buildAttachmentKey(file.name);
      const presign = await base44.request('/media/r2/presign', {
        method: 'POST',
        body: {
          school_id: activeSchoolId,
          key,
          method: 'PUT',
        },
      });

      const response = await fetch(presign.url, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          size: file.size,
          content_type: file.type || 'application/octet-stream',
          key,
          uploaded_at: new Date().toISOString(),
        },
      ]);

      toast.success('Attachment uploaded');
    } catch (error) {
      setUploadError('Upload failed. Please try again.');
      toast.error('Attachment upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;
    for (const file of files) {
      await uploadAttachment(file);
    }
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

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      title,
      content,
      attachments,
      // course_id and lesson_id would typically come from the assignment itself
      // For now, these might need to be added or derived if creating new for an assignmentId
    };

    if (existingSubmissionId) {
      updateSubmissionMutation.mutate(submissionData);
    } else {
      createSubmissionMutation.mutate(submissionData);
    }
  };

  const isLoading = isSessionLoading || isLoadingExistingSubmission;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user || !activeSchoolId) {
    return (
      <PageShell title="Submit Assignment" subtitle="Please log in and select a school.">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <p>Authentication or active school selection required.</p>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title={existingSubmissionId ? 'Edit Submission' : 'Submit Assignment'}
      subtitle={existingSubmissionId ? `ID: ${existingSubmissionId}` : 'New assignment submission'}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to={createPageUrl('Assignments')}>
          <Button variant="ghost" className="group mb-6 pl-0 hover:pl-2 transition-all -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Assignments
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{existingSubmissionId ? 'Edit Your Submission' : 'New Assignment Submission'}</CardTitle>
            <CardDescription>
              {existingSubmissionId ? 'Modify your previously submitted work.' : 'Submit your completed assignment here.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Essay on Chapter 1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your submission here..."
                  rows={10}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="attachments">Attachments</Label>
                <div className="rounded-lg border border-dashed border-border/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Paperclip className="w-4 h-4" />
                      Upload files to include with your submission.
                    </div>
                    <input
                      ref={fileInputRef}
                      id="attachments"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Add files'}
                    </Button>
                  </div>
                  {uploadError ? (
                    <p className="mt-2 text-xs text-destructive">{uploadError}</p>
                  ) : null}
                </div>

                {attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No attachments uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((file, idx) => (
                      <div key={file.key || idx} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{file.name || 'Attachment'}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownload(file)}
                            disabled={downloadingKey === file.key}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAttachment(idx)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={createSubmissionMutation.isPending || updateSubmissionMutation.isPending || isUploading}>
                <Save className="w-4 h-4 mr-2" />
                {existingSubmissionId ? 'Update Submission' : 'Submit Assignment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
