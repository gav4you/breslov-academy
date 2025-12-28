// Lesson Access Control Hook
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export const useLessonAccess = (courseId, lessonId, user, schoolId) => {
  // Fetch content protection policy
  const { data: policy } = useQuery({
    queryKey: ['protection-policy', schoolId],
    queryFn: async () => {
      const policies = await base44.entities.ContentProtectionPolicy.filter({ school_id: schoolId });
      return policies[0] || {
        protect_content: true,
        require_payment_for_materials: true,
        allow_previews: true,
        max_preview_seconds: 90,
        max_preview_chars: 1500,
        watermark_enabled: true,
        block_copy: true,
        block_print: true,
        copy_mode: 'DISALLOW',
        download_mode: 'DISALLOW'
      };
    },
    enabled: !!schoolId
  });

  // Fetch user entitlements
  const { data: entitlements = [] } = useQuery({
    queryKey: ['entitlements', user?.email, schoolId],
    queryFn: () => base44.entities.Entitlement.filter({
      school_id: schoolId,
      user_email: user.email
    }),
    enabled: !!user && !!schoolId
  });

  // Fetch lesson data
  const { data: lesson } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      return lessons[0];
    },
    enabled: !!lessonId
  });

  // Compute access
  const hasCourseAccess = entitlements.some(e => 
    (e.entitlement_type === 'COURSE' && e.course_id === courseId) ||
    e.entitlement_type === 'ALL_COURSES'
  );

  const hasCopyLicense = entitlements.some(e => 
    e.entitlement_type === 'COPY_LICENSE'
  );

  const hasDownloadLicense = entitlements.some(e => 
    e.entitlement_type === 'DOWNLOAD_LICENSE'
  );

  const previewAllowed = policy?.allow_previews && lesson?.is_preview;
  
  const accessLevel = hasCourseAccess ? 'FULL' : (previewAllowed ? 'PREVIEW' : 'LOCKED');
  
  const canCopy = policy?.copy_mode === 'INCLUDED_WITH_ACCESS' 
    ? hasCourseAccess 
    : policy?.copy_mode === 'ADDON' 
    ? hasCopyLicense 
    : false;

  const canDownload = policy?.download_mode === 'INCLUDED_WITH_ACCESS' 
    ? hasCourseAccess 
    : policy?.download_mode === 'ADDON' 
    ? hasDownloadLicense 
    : false;

  const watermarkText = user ? `${user.email} • ${new Date().toLocaleDateString()}` : '';

  return {
    policy,
    hasCourseAccess,
    previewAllowed,
    accessLevel,
    canCopy,
    canDownload,
    hasCopyLicense,
    hasDownloadLicense,
    watermarkText,
    maxPreviewSeconds: policy?.max_preview_seconds || 90,
    maxPreviewChars: policy?.max_preview_chars || 1500
  };
};