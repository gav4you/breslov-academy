// Lesson Access Control Hook
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getEnrollDate, computeLessonAvailability, formatAvailabilityCountdown } from '../drip/dripEngine';

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

  // Import expiry check
  const { isEntitlementActive } = require('../utils/entitlements');
  const now = new Date();

  // Filter to active entitlements only
  const activeEntitlements = entitlements.filter(e => isEntitlementActive(e, now));

  // Compute access (normalize field names, expiry-aware)
  const hasCourseAccess = activeEntitlements.some(e => {
    const type = e.entitlement_type || e.type;
    return (type === 'COURSE' && e.course_id === courseId) || type === 'ALL_COURSES';
  });

  const hasCopyLicense = activeEntitlements.some(e => {
    const type = e.entitlement_type || e.type;
    return type === 'COPY_LICENSE';
  });

  const hasDownloadLicense = activeEntitlements.some(e => {
    const type = e.entitlement_type || e.type;
    return type === 'DOWNLOAD_LICENSE';
  });

  const previewAllowed = policy?.allow_previews && lesson?.is_preview;
  
  let accessLevel = hasCourseAccess ? 'FULL' : (previewAllowed ? 'PREVIEW' : 'LOCKED');
  let dripInfo = { isAvailable: true, availableAt: null, countdownLabel: null };
  
  // DRIP SCHEDULING: Check if lesson is drip-locked
  if (hasCourseAccess && lesson && activeSchoolId && user) {
    // Get enrollment date (cached query to avoid repeated calls)
    const enrollQuery = useQuery({
      queryKey: ['enroll-date', activeSchoolId, user.email, courseId],
      queryFn: () => getEnrollDate({ 
        school_id: activeSchoolId, 
        user_email: user.email, 
        course_id: courseId 
      }),
      enabled: !!activeSchoolId && !!user && !!courseId,
      staleTime: 5 * 60 * 1000 // 5 min cache
    });
    
    const enrollDate = enrollQuery.data;
    
    if (enrollDate) {
      const availability = computeLessonAvailability({ 
        lesson, 
        enrollDate, 
        now: new Date() 
      });
      
      if (!availability.isAvailable) {
        accessLevel = 'DRIP_LOCKED';
        dripInfo = {
          isAvailable: false,
          availableAt: availability.availableAt,
          countdownLabel: formatAvailabilityCountdown(availability.availableAt).label
        };
      }
    }
  }
  
  // CRITICAL: Add-ons require BOTH course access AND the license
  const canCopy = policy?.copy_mode === 'INCLUDED_WITH_ACCESS' 
    ? hasCourseAccess 
    : policy?.copy_mode === 'ADDON' 
    ? (hasCourseAccess && hasCopyLicense)
    : false;

  const canDownload = policy?.download_mode === 'INCLUDED_WITH_ACCESS' 
    ? hasCourseAccess 
    : policy?.download_mode === 'ADDON' 
    ? (hasCourseAccess && hasDownloadLicense)
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