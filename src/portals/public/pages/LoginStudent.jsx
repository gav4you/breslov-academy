import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import AuthProviderButtons from '@/portals/public/components/AuthProviderButtons';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function LoginStudent() {
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
      localStorage.setItem('ba_intended_audience', 'student');
      localStorage.setItem('ba_portal_prefix', '/student');

      // Legacy compatibility keys (kept indefinitely)
      localStorage.setItem('portal_intent', 'student');
      localStorage.setItem('portal_prefix', '/student');
      localStorage.setItem('breslov.login.intent', 'student');
    } catch {}
  }, []);

  const nextPath = useMemo(() => {
    const returnTo = params.get('returnTo');
    if (returnTo) {
      const value = String(returnTo);
      if (!value.includes('://') && value.startsWith('/student')) {
        return value;
      }
    }
    return '/student?loginRole=student';
  }, [params]);

  const handle = () => {
    const origin = window.location.origin;
    navigateToLogin(`${origin}${nextPath}`, { turnstileToken });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Student login</h1>
      <p className="mt-4 text-base text-muted-foreground">
        Sign in to access your lessons, quizzes, progress tracking, and community features.
      </p>
      {authError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {authErrorMessage || 'Sign-in failed. Please try again or contact your school admin.'}
        </div>
      )}
      <div className="mt-8">
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          action="student_login"
          onToken={setTurnstileToken}
          className="mb-6"
        />
        <AuthProviderButtons
          audience="student"
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
        After sign in, you'll be returned to the student dashboard.
      </p>
    </div>
  );
}
