import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/hooks/useSession';
import { FEATURE_FLAGS } from '@/components/config/featureFlags';
import { buildCacheKey, scopedCreate, scopedFilter, scopedUpdate } from '@/components/api/scoped';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageShell from '@/components/ui/PageShell';
import GlassCard from '@/components/ui/GlassCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function SchoolFeatures() {
  const { activeSchool, activeSchoolId, user, isLoading: isSessionLoading } = useSession();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState({});
  const SETTING_PREFIX = 'feature_';

  const schoolFlags = activeSchool?.feature_flags || {};

  const { data: schoolSettings = [] } = useQuery({
    queryKey: buildCacheKey('feature-settings', activeSchoolId),
    queryFn: () => scopedFilter(
      'SchoolSetting',
      activeSchoolId,
      { key: { $startsWith: SETTING_PREFIX } },
      'key',
      200
    ),
    enabled: !!activeSchoolId
  });

  const { data: entityFlags = [] } = useQuery({
    queryKey: buildCacheKey('feature-flag-entities', activeSchoolId),
    queryFn: () => scopedFilter('FeatureFlag', activeSchoolId, {}, 'key', 200),
    enabled: !!activeSchoolId
  });

  const settingsByKey = useMemo(() => {
    return schoolSettings.reduce((acc, setting) => {
      if (!setting?.key?.startsWith(SETTING_PREFIX)) return acc;
      const key = setting.key.replace(SETTING_PREFIX, '');
      acc[key] = setting;
      return acc;
    }, {});
  }, [schoolSettings]);

  const entityFlagsByKey = useMemo(() => {
    return entityFlags.reduce((acc, flag) => {
      if (!flag?.key) return acc;
      acc[flag.key] = flag;
      return acc;
    }, {});
  }, [entityFlags]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedFlags = { ...schoolFlags, ...pendingChanges };
      await scopedUpdate('School', activeSchoolId, { feature_flags: updatedFlags }, activeSchoolId, true);

      const changeEntries = Object.entries(pendingChanges);
      for (const [key, enabled] of changeEntries) {
        const settingKey = `${SETTING_PREFIX}${key}`;
        const existingSetting = settingsByKey[key];
        if (existingSetting) {
          await scopedUpdate('SchoolSetting', existingSetting.id, { value: enabled }, activeSchoolId, true);
        } else {
          await scopedCreate('SchoolSetting', activeSchoolId, { key: settingKey, value: enabled });
        }

        const existingFlag = entityFlagsByKey[key];
        if (existingFlag) {
          await scopedUpdate('FeatureFlag', existingFlag.id, { enabled }, activeSchoolId, true);
        } else {
          const flagDef = FEATURE_FLAGS[key];
          await scopedCreate('FeatureFlag', activeSchoolId, {
            key,
            enabled,
            label: flagDef?.label || key,
            description: flagDef?.description || null,
            scope: 'school'
          });
        }
      }

      if (changeEntries.length > 0 && user?.email) {
        try {
          await scopedCreate('AuditLog', activeSchoolId, {
            user_email: user.email,
            action: 'FEATURE_FLAGS_UPDATED',
            entity_type: 'School',
            entity_id: activeSchoolId,
            metadata: { changes: pendingChanges }
          });
        } catch (error) {
          // Best-effort audit logging.
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session']); // Refresh session to get new flags
      queryClient.invalidateQueries(buildCacheKey('feature-flag-entities', activeSchoolId));
      queryClient.invalidateQueries(buildCacheKey('feature-settings', activeSchoolId));
      setPendingChanges({});
      toast.success('Feature settings saved');
    }
  });

  if (isSessionLoading) return <DashboardSkeleton />;

  if (!activeSchoolId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <AlertCircle className="w-12 h-12 mx-auto mb-4" />
        No active school selected.
      </div>
    );
  }

  const hasChanges = Object.keys(pendingChanges).length > 0;

  // Only show flags scoped to 'school'
  const visibleFlags = Object.values(FEATURE_FLAGS).filter(f => f.scope === 'school');

  const normalizeFlagValue = (value) => {
    if (typeof value === 'undefined') return undefined;
    return value === true || value === 'true';
  };

  const resolveBaseValue = (flag) => {
    if (!flag) return false;
    const schoolValue = normalizeFlagValue(schoolFlags[flag.key]);
    if (typeof schoolValue !== 'undefined') return schoolValue;
    const settingValue = normalizeFlagValue(settingsByKey[flag.key]?.value);
    if (typeof settingValue !== 'undefined') return settingValue;
    const entityValue = normalizeFlagValue(entityFlagsByKey[flag.key]?.enabled);
    if (typeof entityValue !== 'undefined') return entityValue;
    return flag.defaultValue;
  };

  return (
    <PageShell 
      title="Feature Manager" 
      subtitle="Enable or disable optional features for your school."
    >
      <GlassCard className="p-6">
        <div className="space-y-6">
          {visibleFlags.map((flag) => {
            const baseValue = resolveBaseValue(flag);
            const currentValue = pendingChanges[flag.key] !== undefined
              ? pendingChanges[flag.key]
              : baseValue;
            const entityValue = normalizeFlagValue(entityFlagsByKey[flag.key]?.enabled);
            const schoolValue = normalizeFlagValue(schoolFlags[flag.key]);
            const isOutOfSync = typeof schoolValue !== 'undefined'
              && typeof entityValue !== 'undefined'
              && schoolValue !== entityValue;

            return (
              <div key={flag.key} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{flag.label}</h3>
                    {flag.defaultValue && <Badge variant="secondary" className="text-[10px] h-5">Default On</Badge>}
                    {isOutOfSync && <Badge variant="outline" className="text-[10px] h-5">Out of Sync</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                </div>
                <Switch 
                  checked={currentValue}
                  onCheckedChange={(checked) => {
                    const next = { ...pendingChanges, [flag.key]: checked };
                    if (checked === baseValue) delete next[flag.key];
                    setPendingChanges(next);
                  }}
                />
              </div>
            );
          })}
        </div>

        {hasChanges && (
          <div className="mt-8 flex justify-end pt-4 border-t border-border/50">
            <Button 
              onClick={() => saveMutation.mutate()} 
              disabled={saveMutation.isPending}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </GlassCard>
    </PageShell>
  );
}
