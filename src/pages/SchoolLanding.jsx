import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '@/components/hooks/useStorefrontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, BookOpen, Users, HelpCircle, CheckCircle } from 'lucide-react';
import SchoolHero from '@/components/storefront/SchoolHero';
import CourseCard from '@/components/courses/CourseCard';
import { tokens, cx } from '@/components/theme/tokens';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoaders';

export default function SchoolLanding() {
  const [user, setUser] = useState(null);
  const { schoolSlug: slug } = useStorefrontContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        // User not logged in - that's ok for public page
      }
    };
    loadUser();
  }, []);

  // Track page view + capture attribution
  useEffect(() => {
    if (slug) {
      import('@/components/analytics/attribution').then(({ captureAttributionFromUrl }) => {
        captureAttributionFromUrl({ schoolSlug: slug });
      });
      
      import('@/components/analytics/track').then(({ trackPageView }) => {
        import('@/components/analytics/attribution').then(({ getAttribution, attachAttribution }) => {
          base44.entities.School.filter({ slug }).then(schools => {
            if (schools[0]) {
              const attribution = getAttribution({ schoolSlug: slug });
              trackPageView({
                school_id: schools[0].id,
                user_email: user?.email,
                path: '/schoollanding',
                meta: attachAttribution({ slug }, attribution)
              });
            }
          });
        });
      });
    }
  }, [slug, user]);

  const { data: school, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['public-courses', school?.id],
    queryFn: () => base44.entities.Course.filter({
      school_id: school.id,
      is_published: true
    }, '-created_date', 6),
    enabled: !!school?.id
  });

  const { data: testimonials = [] } = useQuery({
    queryKey: ['testimonials', school?.id],
    queryFn: () => base44.entities.Testimonial.filter({ school_id: school.id }, '-created_date', 6),
    enabled: !!school?.id
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['instructors', school?.id],
    queryFn: async () => {
      const members = await base44.entities.SchoolMembership.filter({
        school_id: school.id,
        role: { $in: ['INSTRUCTOR', 'ADMIN', 'OWNER'] }
      });
      return members.slice(0, 4);
    },
    enabled: !!school?.id
  });

  if (isLoadingSchool) {
    return <DashboardSkeleton />;
  }

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-muted rounded-full p-6 mb-6">
          <HelpCircle className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className={tokens.text.h2}>School Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The school you are looking for does not exist or has been moved.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SchoolHero school={school} user={user} slug={slug} />

      {/* Benefits Section */}
      <div className="bg-muted/30 py-24 border-b border-border/50">
        <div className={tokens.page.inner}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className={tokens.text.h3}>Premium Content</h3>
              <p className={tokens.text.body}>Access exclusive teachings and materials curated by experts.</p>
            </div>
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className={tokens.text.h3}>Global Community</h3>
              <p className={tokens.text.body}>Join a vibrant community of students and share insights.</p>
            </div>
            <div className="space-y-4 group">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className={tokens.text.h3}>Self-Paced Learning</h3>
              <p className={tokens.text.body}>Learn at your own rhythm with 24/7 access to all materials.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className={cx(tokens.page.inner, "py-24")}>
        <div className="text-center mb-16">
          <h2 className={tokens.text.h1}>Featured Courses</h2>
          <p className={cx(tokens.text.lead, "mt-4 max-w-2xl mx-auto")}>
            Explore our most popular learning paths and start your journey today.
          </p>
        </div>
        
        <div className={cx("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3", tokens.layout.gridGap)}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} userTier="free" />
          ))}
        </div>
        
        {courses.length > 0 && (
          <div className="mt-16 text-center">
            <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                View All Courses
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <div className="bg-muted/30 py-24 border-y border-border/50">
          <div className={tokens.page.inner}>
            <h2 className={cx(tokens.text.h1, "text-center mb-16")}>Student Stories</h2>
            <div className={cx("grid grid-cols-1 md:grid-cols-3", tokens.layout.gridGap)}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={cx(tokens.glass.card, "p-8 h-full flex flex-col")}>
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    ))}
                  </div>
                  <blockquote className="text-lg italic leading-relaxed mb-8 flex-1 text-foreground/90">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center pt-6 border-t border-border/50">
                    {testimonial.avatar_url ? (
                      <img src={testimonial.avatar_url} className="w-12 h-12 rounded-full mr-4 object-cover ring-2 ring-background" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4 ring-2 ring-background">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground">{testimonial.name}</p>
                      {testimonial.role && (
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructors */}
      {instructors.length > 0 && (
        <div className={cx(tokens.page.inner, "py-24")}>
          <h2 className={cx(tokens.text.h1, "text-center mb-16")}>Meet Our Instructors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="text-center group">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <div className="absolute inset-0 bg-primary/10 rounded-full scale-90 group-hover:scale-110 transition-transform duration-500" />
                  <div className="relative w-full h-full bg-muted rounded-full flex items-center justify-center overflow-hidden ring-4 ring-background shadow-xl">
                    <Users className="w-20 h-20 text-muted-foreground/50" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-1">{instructor.user_email.split('@')[0]}</h3>
                <p className="text-sm text-primary font-medium uppercase tracking-wider">{instructor.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="py-24 bg-muted/30 border-t border-border/50">
        <div className={tokens.page.inner}>
          <h2 className={cx(tokens.text.h1, "text-center mb-16")}>Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "How do I access the courses?", a: "Once you purchase or enroll in a course, it will be available in your personal dashboard under 'My Courses'." },
              { q: "Are the courses live or recorded?", a: "Most of our courses are pre-recorded for self-paced learning, but some include live Q&A sessions or webinars." },
              { q: "Can I get a refund if I'm not satisfied?", a: "We offer a 14-day satisfaction guarantee. If you're not happy with the content, contact our support team for a full refund." }
            ].map((faq, i) => (
              <div key={i} className={cx(tokens.glass.card, "p-6 hover:border-primary/30 transition-colors")}>
                <h3 className="font-bold text-lg mb-2 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-1" />
                  {faq.q}
                </h3>
                <p className="text-muted-foreground ml-8 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="relative overflow-hidden bg-primary py-24 text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight font-serif">Ready to Start Learning?</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto font-light">Join thousands of students already learning with us.</p>
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
            <Button 
              size="lg" 
              variant="secondary" 
              className="h-14 px-10 text-lg shadow-2xl hover:scale-105 transition-transform duration-200 font-semibold"
            >
              Explore Our Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}