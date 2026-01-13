import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import TurnstileWidget from '@/components/security/TurnstileWidget';

export default function SignupSchool() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    description: ''
  });
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRequired = Boolean(turnstileSiteKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create pending application
      await base44.entities.TenantApplication.create({
        name: formData.name,
        slug: formData.slug,
        admin_email: formData.email,
        description: formData.description,
        status: 'pending',
        turnstile_token: turnstileToken
      });
      
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (err) {
      console.error('Signup error:', err);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Application Received!</h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          Thank you for your interest in starting a school at Breslov Academy. 
          Our team will review your application and contact you at <strong>{formData.email}</strong> within 24-48 hours.
        </p>
        <div className="mt-10">
          <Button asChild variant="outline">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link to="/signup" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to chooser
      </Link>

      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-muted/30 pb-8 border-b">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold">Start a New School</h1>
          </div>
          <CardDescription className="text-base">
            Create your own dedicated platform for teaching and community.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">School Name</label>
                <Input 
                  required
                  placeholder="e.g. Breslov Wisdom Center" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Desired URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-xs text-muted-foreground">/s/</span>
                  <Input 
                    required
                    placeholder="wisdom-center" 
                    className="rounded-l-none"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Administrator Email</label>
              <Input 
                required
                type="email"
                placeholder="you@example.com" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Tell us about your school</label>
              <Textarea 
                required
                placeholder="What kind of courses will you offer? Who is your intended audience?" 
                className="min-h-[120px]"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800/50">
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Next steps:</strong> After submitting this form, our administrators will review your request. 
                Once approved, you will receive a link to complete your tenant setup and access your school admin portal.
              </p>
            </div>

            <TurnstileWidget
              siteKey={turnstileSiteKey}
              action="school_signup"
              onToken={setTurnstileToken}
            />

            <Button
              type="submit"
              className="w-full py-6 text-lg font-semibold shadow-lg"
              disabled={loading || (turnstileRequired && !turnstileToken)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit School Application'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
