import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OfferCard from '../components/monetization/OfferCard';
import { Button } from '@/components/ui/button';

export default function SchoolPricing() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

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

  const { data: school } = useQuery({
    queryKey: ['school-by-slug', slug],
    queryFn: async () => {
      const schools = await base44.entities.School.filter({ slug });
      return schools[0];
    },
    enabled: !!slug
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['pricing-offers', school?.id],
    queryFn: () => base44.entities.Offer.filter({
      school_id: school.id,
      offer_type: { $in: ['ALL_COURSES', 'SUBSCRIPTION'] }
    }),
    enabled: !!school?.id
  });

  if (!school) {
    return <div className="text-center py-20">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link to={createPageUrl(`SchoolLanding?slug=${slug}`)} className="text-amber-400 hover:underline mb-4 block">
            ← Back to {school.name}
          </Link>
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-slate-300">
            Unlock unlimited access to all courses and premium features
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, i) => (
            <OfferCard 
              key={offer.id} 
              offer={offer} 
              schoolSlug={slug}
              highlighted={i === 1}
            />
          ))}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">Pricing plans coming soon</p>
            <Link to={createPageUrl(`SchoolCourses?slug=${slug}`)}>
              <Button>Browse Courses</Button>
            </Link>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm text-slate-600">
                Yes, you can cancel your subscription at any time with no penalties.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-sm text-slate-600">
                We accept all major credit cards and PayPal. Manual payment options available for institutional buyers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}