import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/components/hooks/useSession';
import { FEATURE_FLAGS } from '@/components/config/featureFlags';
import { scopedUpdate } from '@/components/api/scoped';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import PageShell from '@/components/ui/PageShell';
import GlassCard from '@/components/ui/GlassCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function SchoolFeatures() {
  const { activeSchoolId, activeSchool, isLoading: isSessionLoading } = useSession();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState({});

  const schoolFlags = activeSchool?.feature_flags || {};

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updatedFlags = { ...schoolFlags, ...pendingChanges };
      await scopedUpdate('School', activeSchoolId, { feature_flags: updatedFlags }, activeSchoolId, true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['session']); // Refresh session to get new flags
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

  const toggleFlag = (key, checked) => {
    setPendingChanges(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  // Only show flags scoped to 'school'
  const visibleFlags = Object.values(FEATURE_FLAGS).filter(f => f.scope === 'school');

  return (
    <PageShell 
      title="Feature Manager" 
      subtitle="Enable or disable optional features for your school."
    >
      <GlassCard className="p-6">
        <div className="space-y-6">
          {visibleFlags.map((flag) => {
            const currentValue = pendingChanges[flag.key] !== undefined 
              ? pendingChanges[flag.key] 
              : (schoolFlags[flag.key] ?? flag.defaultValue);

            return (
              <div key={flag.key} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{flag.label}</h3>
                    {flag.defaultValue && <Badge variant="secondary" className="text-[10px] h-5">Default On</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                </div>
                <Switch 
                  checked={currentValue}
                  onCheckedChange={(checked) => toggleFlag(flag.key, checked)}
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
