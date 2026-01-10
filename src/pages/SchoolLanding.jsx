import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import useStorefrontContext from '@/components/hooks/useStorefrontContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, BookOpen, Users } from 'lucide-react';
import SchoolHero from '@/components/storefront/SchoolHero';
import CourseCard from '@/components/courses/CourseCard';
import { tokens, cx } from '@/components/theme/tokens';

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
      // Capture attribution from URL
      import('@/components/analytics/attribution').then(({ captureAttributionFromUrl }) => {
        captureAttributionFromUrl({ schoolSlug: slug });
      });
      
      // Track page view
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

  const { data: school } = useQuery({
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

  if (!school) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">School not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SchoolHero school={school} user={user} slug={slug} />

      {/* Benefits Section */}
      <div className="bg-slate-50 py-24">
        <div className={tokens.page.inner}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Premium Content</h3>
              <p className="text-muted-foreground">Access exclusive teachings and materials curated by experts.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Global Community</h3>
              <p className="text-muted-foreground">Join a vibrant community of students and share insights.</p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold">Self-Paced Learning</h3>
              <p className="text-muted-foreground">Learn at your own rhythm with 24/7 access to all materials.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className={cx(tokens.page.inner, "py-24")}>
        <div className="text-center mb-16">
          <h2 className={tokens.text.h1}>Featured Courses</h2>
          <p className={tokens.text.lead + " mt-4 max-w-2xl mx-auto"}>
            Explore our most popular learning paths and start your journey today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} userTier="free" />
          ))}
        </div>
        
        {courses.length > 0 && (
          <div className="mt-12 text-center">
            <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
              <Button variant="outline" size="lg">
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
            <h2 className={tokens.text.h1 + " text-center mb-16"}>Student Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className={tokens.glass.card + " border-none shadow-md"}>
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-foreground/80 mb-6 text-lg italic leading-relaxed">"{testimonial.quote}"</p>
                    <div className="flex items-center mt-auto">
                      {testimonial.avatar_url ? (
                        <img src={testimonial.avatar_url} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{testimonial.name}</p>
                        {testimonial.role && (
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructors */}
      {instructors.length > 0 && (
        <div className={cx(tokens.page.inner, "py-24")}>
          <h2 className={tokens.text.h1 + " text-center mb-16"}>Meet Our Instructors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="text-center border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                  <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden ring-4 ring-background shadow-xl">
                    <Users className="w-16 h-16 text-muted-foreground/50" />
                  </div>
                  <p className="font-bold text-lg">{instructor.user_email.split('@')[0]}</p>
                  <p className="text-sm text-primary font-medium uppercase tracking-wider mt-1">{instructor.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className={cx(tokens.page.inner, "py-24")}>
        <h2 className={tokens.text.h1 + " text-center mb-16"}>Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="p-6 border rounded-xl hover:bg-slate-50 transition-colors">
            <h3 className="font-bold text-lg mb-2">How do I access the courses?</h3>
            <p className="text-muted-foreground">Once you purchase or enroll in a course, it will be available in your personal dashboard under "My Courses".</p>
          </div>
          <div className="p-6 border rounded-xl hover:bg-slate-50 transition-colors">
            <h3 className="font-bold text-lg mb-2">Are the courses live or recorded?</h3>
            <p className="text-muted-foreground">Most of our courses are pre-recorded for self-paced learning, but some include live Q&A sessions or webinars.</p>
          </div>
          <div className="p-6 border rounded-xl hover:bg-slate-50 transition-colors">
            <h3 className="font-bold text-lg mb-2">Can I get a refund if I'm not satisfied?</h3>
            <p className="text-muted-foreground">We offer a 14-day satisfaction guarantee. If you're not happy with the content, contact our support team for a full refund.</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div 
        className="bg-primary text-primary-foreground py-24"
        style={school.brand_primary ? { backgroundColor: school.brand_primary, color: '#ffffff' } : {}}
      >
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6 tracking-tight">Ready to Start Learning?</h2>
          <p className="text-xl opacity-90 mb-10">Join thousands of students already learning with us.</p>
          <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
            <Button 
              size="lg" 
              variant="secondary" 
              className="h-14 px-8 text-lg shadow-xl hover:bg-secondary/90"
              style={school.brand_primary ? { color: school.brand_primary } : {}}
            >
              Explore Our Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}