import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function SignupStudent() {
  const { navigateToLogin } = useAuth();
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRequired = Boolean(turnstileSiteKey);

  useEffect(() => {
    try {
      localStorage.setItem('ba_intended_audience', 'student');
      localStorage.setItem('ba_portal_prefix', '/student');
      localStorage.setItem('breslov.login.intent', 'student');
    } catch {}
  }, []);

  const handle = () => {
    // Student signup uses the same Base44 auth but with student intent
    const origin = window.location.origin;
    navigateToLogin(`${origin}/student?loginRole=student`, { turnstileToken });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link to="/signup" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to chooser
      </Link>

      <Card className="border-2 shadow-sm">
        <CardHeader className="text-center pb-2">
          <h1 className="text-3xl font-bold">Join as a Student</h1>
          <CardDescription className="text-lg pt-2">
            Register to access lessons, track your progress, and join the community.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Breslov Academy uses a secure single-sign-on system. 
                Clicking below will take you to our registration page. 
                After registering, you will be returned here to complete your student profile.
              </p>
            </div>

            <TurnstileWidget
              siteKey={turnstileSiteKey}
              action="student_signup"
              onToken={setTurnstileToken}
            />

            <Button onClick={handle} className="w-full py-6 text-lg font-semibold" disabled={turnstileRequired && !turnstileToken}>
              Register with secure SSO
            </Button>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By signing up, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
