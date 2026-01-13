import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function SignupTeacher() {
  const { navigateToLogin } = useAuth();
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRequired = Boolean(turnstileSiteKey);

  useEffect(() => {
    try {
      localStorage.setItem('ba_intended_audience', 'teacher');
      localStorage.setItem('ba_portal_prefix', '/teacher');
      localStorage.setItem('breslov.login.intent', 'teacher');
    } catch {}
  }, []);

  const handle = () => {
    const origin = window.location.origin;
    navigateToLogin(`${origin}/teacher?loginRole=teacher`, { turnstileToken });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link to="/signup" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to chooser
      </Link>

      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-3xl font-bold">Join as a Teacher</h1>
          <CardDescription className="text-lg pt-2">
            Share your knowledge and manage your academic community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Teacher benefits:</h3>
            <ul className="space-y-3">
              {[
                'Build and manage your own courses',
                'Track student progress and performance',
                'Create quizzes and assignments',
                'Manage your academic community'
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              Note: Teacher applications are subject to approval by school administrators.
            </p>
          </div>

          <TurnstileWidget
            siteKey={turnstileSiteKey}
            action="teacher_signup"
            onToken={setTurnstileToken}
          />

          <Button
            onClick={handle}
            className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
            disabled={turnstileRequired && !turnstileToken}
          >
            Register as Teacher
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing up, you agree to our <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
