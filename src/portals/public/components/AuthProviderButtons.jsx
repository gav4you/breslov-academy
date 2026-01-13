import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

const PROVIDER_LABELS = {
  google: 'Continue with Google',
  microsoft: 'Continue with Microsoft',
};

function normalizeNextPath(path) {
  if (!path) return '/';
  if (path.startsWith('/')) return path;
  return `/${path}`;
}

function buildStartUrl(provider, audience, nextPath, schoolSlug, schoolId, turnstileToken) {
  const origin = window.location.origin;
  const target = new URL('/api/auth/oidc/start', origin);
  target.searchParams.set('provider', provider);
  target.searchParams.set('next', `${origin}${normalizeNextPath(nextPath)}`);
  if (audience) target.searchParams.set('audience', audience);
  if (schoolSlug) target.searchParams.set('schoolSlug', schoolSlug);
  if (schoolId) target.searchParams.set('schoolId', schoolId);
  if (turnstileToken) target.searchParams.set('turnstileToken', turnstileToken);
  return target.toString();
}

export default function AuthProviderButtons({
  audience,
  schoolSlug,
  schoolId,
  nextPath,
  onFallback,
  fallbackLabel,
  turnstileToken,
  turnstileRequired,
}) {
  const storedSchoolId = useMemo(() => {
    try {
      return localStorage.getItem('active_school_id') || '';
    } catch {
      return '';
    }
  }, []);

  const resolvedSchoolId = schoolId || storedSchoolId || '';

  const { data, isLoading } = useQuery({
    queryKey: ['auth-providers', schoolSlug, resolvedSchoolId],
    queryFn: () => base44.request('/auth/providers', {
      params: schoolSlug ? { schoolSlug } : resolvedSchoolId ? { schoolId: resolvedSchoolId } : undefined,
    }),
  });

  const providers = useMemo(() => {
    const list = data?.providers || [];
    return list.filter((provider) => provider.allowed);
  }, [data]);
  const turnstileBlocked = Boolean(turnstileRequired && !turnstileToken);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        Checking available sign-in options...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {providers.length > 0 ? (
        <div className="grid gap-3">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              className="h-12 justify-between"
              disabled={turnstileBlocked}
              onClick={() => window.location.assign(buildStartUrl(provider.id, audience, nextPath, schoolSlug, resolvedSchoolId, turnstileToken))}
            >
              <span>{PROVIDER_LABELS[provider.id] || `Continue with ${provider.id}`}</span>
              <Badge variant="secondary" className="ml-2">SSO</Badge>
            </Button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>No SSO providers are enabled for this school yet.</span>
          </div>
        </div>
      )}

      {onFallback && (
        <Button variant="outline" className="h-11 w-full" onClick={onFallback} disabled={turnstileBlocked}>
          {fallbackLabel || 'Continue with secure login'}
        </Button>
      )}
      {turnstileBlocked && (
        <p className="text-xs text-muted-foreground">
          Complete the security check to enable sign in.
        </p>
      )}
    </div>
  );
}
