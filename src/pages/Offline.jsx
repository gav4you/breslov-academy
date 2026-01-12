import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trash2, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/components/hooks/useSession';
import { scopedCreate, scopedFilter } from '@/components/api/scoped';
import { canDownload, checkCourseAccess, isEntitlementActive } from '@/components/utils/entitlements';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';
import {
  addOfflineCacheItem,
  estimateOfflineStorage,
  loadOfflineCache,
  removeOfflineCacheItem
} from '@/components/mobile/offlineStorage';

const DEFAULT_POLICY = {
  protect_content: true,
  require_payment_for_materials: true,
  allow_previews: true,
  max_preview_seconds: 90,
  max_preview_chars: 1500,
  watermark_enabled: true,
  block_right_click: true,
  block_copy: true,
  block_print: true,
  download_mode: 'DISALLOW',
  copy_mode: 'DISALLOW'
};

export default function Offline() {
  const [cachedItems, setCachedItems] = useState([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(5000);
  const [, setIsDownloading] = useState(false);
  const { user, activeSchoolId, role, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) {
      try {
        base44.auth.redirectToLogin();
      } catch {}
    }
  }, [isLoading, user]);

  useEffect(() => {
    if (activeSchoolId) {
      loadCachedData(activeSchoolId);
    } else {
      setCachedItems([]);
      setStorageUsed(0);
      setStorageQuota(5000);
    }
  }, [activeSchoolId]);

  const loadCachedData = async (schoolId) => {
    try {
      const scopedCache = await loadOfflineCache(schoolId);
      setCachedItems(scopedCache);
      const { usedKb, quotaKb } = await estimateOfflineStorage(schoolId, scopedCache);
      setStorageUsed(usedKb);
      setStorageQuota(quotaKb);
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  };

  const handleDownloadCourse = async (courseId) => {
    try {
      if (!activeSchoolId || !user?.email) {
        toast.error('Select a school to download offline content.');
        return;
      }
      if (!courseId) {
        toast.error('Missing course id.');
        return;
      }

      setIsDownloading(true);

      const courses = await scopedFilter(
        'Course',
        activeSchoolId,
        { id: courseId },
        null,
        1,
        { fields: ['id', 'title', 'access_level', 'access_tier', 'school_id'] }
      );
      const course = courses?.[0];
      if (!course) {
        toast.error('Course not found.');
        return;
      }

      const entitlements = await scopedFilter('Entitlement', activeSchoolId, {
        user_email: user.email
      });
      const activeEntitlements = entitlements.filter((ent) => isEntitlementActive(ent, new Date()));

      const policies = await scopedFilter('ContentProtectionPolicy', activeSchoolId, {}, null, 1);
      const policy = policies?.[0] || DEFAULT_POLICY;

      const hasAccess = await checkCourseAccess(course, user.email, role);
      const accessLevel = hasAccess ? 'FULL' : 'LOCKED';
      const downloadAllowed = canDownload({
        policy,
        entitlements: activeEntitlements,
        accessLevel
      });

      if (!downloadAllowed) {
        toast.error('Download access required for offline content.');
        return;
      }

      const lessons = await scopedFilter(
        'Lesson',
        activeSchoolId,
        { course_id: courseId },
        'order',
        500,
        {
          fields: [
            'id',
            'course_id',
            'title',
            'title_hebrew',
            'content',
            'content_json',
            'text',
            'video_url',
            'audio_url',
            'duration_seconds',
            'duration_minutes',
            'is_preview',
            'order'
          ]
        }
      );
      
      // Store in localStorage
      const cacheData = {
        id: courseId,
        type: 'course',
        title: course.title,
        data: { course, lessons },
        school_id: activeSchoolId,
        cachedAt: new Date().toISOString()
      };
      
      await addOfflineCacheItem(activeSchoolId, cacheData);

      try {
        await scopedCreate('EventLog', activeSchoolId, {
          school_id: activeSchoolId,
          user_email: user.email,
          event_type: 'offline_cache',
          entity_type: 'Course',
          entity_id: courseId,
          metadata: { lesson_count: lessons.length }
        });
      } catch (e) {
        // Best effort logging
      }
      
      toast.success('Course downloaded for offline access!');
      await loadCachedData(activeSchoolId);
    } catch (error) {
      toast.error('Failed to download course');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRemoveCache = async (id) => {
    await removeOfflineCacheItem(activeSchoolId, id);
    toast.success('Removed from offline storage');
    await loadCachedData(activeSchoolId);
  };

  const storagePercent = useMemo(() => {
    if (!storageQuota) return 0;
    return Math.min((storageUsed / storageQuota) * 100, 100);
  }, [storageUsed, storageQuota]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Offline Study</h1>
        <p className="text-slate-600">Download content for offline access</p>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="w-5 h-5 mr-2" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>{storageUsed} KB used</span>
              <span>~{storageQuota} KB available</span>
            </div>
            <Progress value={storagePercent} />
          </div>
        </CardContent>
      </Card>

      {/* Cached Items */}
      <Card>
        <CardHeader>
          <CardTitle>Downloaded Content</CardTitle>
        </CardHeader>
        <CardContent>
          {!activeSchoolId ? (
            <p className="text-slate-500 text-center py-8">
              Select a school to manage offline downloads.
            </p>
          ) : cachedItems.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No offline content yet</p>
          ) : (
            <div className="space-y-3">
              {cachedItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      Downloaded {new Date(item.cachedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveCache(item.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use Offline Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p>1. Download courses or texts for offline access using the download button</p>
          <p>2. Your highlights and notes are automatically saved locally</p>
          <p>3. When online, changes will sync automatically</p>
          <p className="text-amber-600 font-medium mt-4">
            Note: Offline functionality is limited in this version. Full PWA support coming soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
