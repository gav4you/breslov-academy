import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '@/components/hooks/useStorefrontContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Crown, ShieldCheck, Zap } from 'lucide-react';
import { tokens, cx } from '@/components/theme/tokens';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function SchoolPricing() {
  const [user, setUser] = useState(null);
  const { schoolSlug: slug } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // Guest ok
      }
    };
    loadUser();
  }, []);

  // Track page view
  useEffect(() => {
    if (school) {
      import('../components/analytics/track').then(({ trackEvent }) => {
        trackEvent({
          school_id: school.id,
          user_email: user?.email,
          event_type: 'viewed_pricing'
        });
      });
    }
  }, [school, user]);

  const { data: school, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['offers', school?.id],
    queryFn: () => base44.entities.Offer.filter({ 
      school_id: school.id 
    }, '-created_date'),
    enabled: !!school
  });

  // Group offers by type
  const courseOffers = offers.filter(o => o.offer_type === 'COURSE');
  const bundleOffers = offers.filter(o => o.offer_type === 'BUNDLE');
  const subscriptions = offers.filter(o => o.offer_type === 'SUBSCRIPTION');
  const addOns = offers.filter(o => o.offer_type === 'ADDON');

  if (isLoadingSchool) {
    return <DashboardSkeleton />;
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 text-center">
        <p className="text-slate-600">School not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={cx(tokens.text.h1, "text-white mb-4")}>Choose Your Plan</h1>
          <p className={cx(tokens.text.lead, "text-slate-300 max-w-2xl mx-auto")}>
            Invest in your spiritual growth with {school.name}. Simple pricing, lifetime value.
          </p>
        </div>
      </div>

      <div className={cx(tokens.page.inner, "py-12 space-y-20")}>
        
        {/* Subscriptions (Best Value) */}
        {subscriptions.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white mb-3 border-none px-3 py-1">
                <Crown className="w-3 h-3 mr-1.5" />
                Recommended
              </Badge>
              <h2 className={tokens.text.h2}>Unlimited Access</h2>
              <p className={cx(tokens.text.body, "text-muted-foreground mt-2")}>
                Unlock the entire library with a simple monthly plan.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className={cx(
                  tokens.glass.card, 
                  "border-2 border-amber-500/30 shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300"
                )}>
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600" />
                  <CardHeader>
                    <CardTitle className="text-2xl">{sub.name}</CardTitle>
                    <CardDescription>{sub.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-8 flex items-baseline">
                      <span className="text-4xl font-bold tracking-tight text-foreground">
                        ${(sub.price_cents / 100).toFixed(0)}
                      </span>
                      <span className="text-muted-foreground ml-1 font-medium">/month</span>
                    </div>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Access to all current courses</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">New courses added monthly</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Premium community access</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">Cancel anytime</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${sub.id}`)} className="w-full">
                      <Button size="lg" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg">
                        Start Subscription
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Bundles */}
        {bundleOffers.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 mb-3 border-none">
                <Zap className="w-3 h-3 mr-1.5" />
                Best Savings
              </Badge>
              <h2 className={tokens.text.h2}>Course Bundles</h2>
              <p className={cx(tokens.text.body, "text-muted-foreground mt-2")}>
                Master a topic deeply and save by bundling.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {bundleOffers.map((bundle) => (
                <div key={bundle.id} className={cx(tokens.glass.card, tokens.glass.cardHover, "flex flex-col h-full")}>
                  <CardHeader>
                    <CardTitle className="text-xl">{bundle.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-foreground">
                        ${(bundle.price_cents / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Includes multiple courses for a complete learning path.
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${bundle.id}`)} className="w-full">
                      <Button className="w-full" variant="outline">
                        Get Bundle
                      </Button>
                    </Link>
                  </CardFooter>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Individual Courses */}
        {courseOffers.length > 0 && (
          <section>
            <div className="text-center mb-10">
              <h2 className={tokens.text.h2}>Individual Courses</h2>
              <p className={cx(tokens.text.body, "text-muted-foreground mt-2")}>
                Lifetime access with a one-time payment.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {courseOffers.map((course) => (
                <div key={course.id} className={cx(tokens.glass.card, tokens.glass.cardHover, "flex flex-col h-full")}>
                  <CardHeader>
                    <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <span className="text-2xl font-bold text-foreground">
                      ${(course.price_cents / 100).toFixed(2)}
                    </span>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${course.id}`)} className="w-full">
                      <Button className="w-full bg-primary/90 hover:bg-primary">
                        Enroll Now
                      </Button>
                    </Link>
                  </CardFooter>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Add-ons */}
        {addOns.length > 0 && (
          <section className="bg-muted/30 rounded-2xl p-8 border border-border/50">
            <div className="text-center mb-8">
              <h2 className={tokens.text.h3}>Additional Resources</h2>
              <p className="text-sm text-muted-foreground mt-1">Enhance your learning with these add-ons</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {addOns.map((addon) => (
                <div key={addon.id} className="bg-background border border-border/60 rounded-lg p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-semibold text-foreground">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">{addon.description}</p>
                  </div>
                  <Link to={createPageUrl(`SchoolCheckout?slug=${slug}&offerId=${addon.id}`)}>
                    <Button size="sm" variant="secondary">
                      ${(addon.price_cents / 100).toFixed(2)}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trust Section */}
        <div className="text-center max-w-2xl mx-auto pt-8">
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            "This platform transformed my learning experience."
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Secure Checkout</span>
            <span>•</span>
            <span>Instant Access</span>
            <span>•</span>
            <span>Satisfaction Guarantee</span>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center pb-8">
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
            <Button variant="link" className="text-muted-foreground hover:text-foreground">
              Continue Browsing Catalog &rarr;
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}