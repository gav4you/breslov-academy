import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import AuthProviderButtons from '@/portals/public/components/AuthProviderButtons';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function LoginTeacher() {
  const { navigateToLogin } = useAuth();
  const [params] = useSearchParams();

  const schoolSlug = params.get('schoolSlug') || params.get('school_slug') || '';
  const schoolId = params.get('schoolId') || params.get('school_id') || '';
  const authError = params.get('authError');
  const authErrorMessage = params.get('authErrorMessage');
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const authLoginUrl = import.meta.env.VITE_AUTH_LOGIN_URL;
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRequired = Boolean(turnstileSiteKey);
  const allowFallback = Boolean(authLoginUrl);

  useEffect(() => {
    try {
      // Canonical intent keys (v9.1+)
      localStorage.setItem('ba_intended_audience', 'teacher');
      localStorage.setItem('ba_portal_prefix', '/teacher');

      // Legacy compatibility keys (kept indefinitely)
      localStorage.setItem('portal_intent', 'teacher');
      localStorage.setItem('portal_prefix', '/teacher');
      localStorage.setItem('breslov.login.intent', 'teacher');
    } catch {}
  }, []);

  const nextPath = useMemo(() => {
    const returnTo = params.get('returnTo');
    if (returnTo) {
      const value = String(returnTo);
      if (!value.includes('://') && (value.startsWith('/teacher') || value.startsWith('/admin'))) {
        return value;
      }
    }
    return '/teacher?loginRole=teacher';
  }, [params]);

  const handle = () => {
    const origin = window.location.origin;
    navigateToLogin(`${origin}${nextPath}`, { turnstileToken });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Teacher login</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Sign in to manage courses, lessons, quizzes, and analytics for your school.
      </p>
      {authError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {authErrorMessage || 'Sign-in failed. Please try again or contact your school admin.'}
        </div>
      )}
      <div className="mt-8">
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          action="teacher_login"
          onToken={setTurnstileToken}
          className="mb-6"
        />
        <AuthProviderButtons
          audience="teacher"
          schoolSlug={schoolSlug}
          schoolId={schoolId}
          nextPath={nextPath}
          onFallback={allowFallback ? handle : null}
          fallbackLabel={allowFallback ? 'Use secure login' : undefined}
          turnstileToken={turnstileToken}
          turnstileRequired={turnstileRequired}
        />
      </div>
      <div className="mt-6">
        <Button variant="outline" onClick={() => window.history.back()}>Go back</Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        After sign in, you'll be returned to the teaching portal.
      </p>
    </div>
  );
}
