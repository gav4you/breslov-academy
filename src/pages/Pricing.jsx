import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import PricingCard from '../components/subscription/PricingCard';

export default function Pricing() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const plans = [
    {
      tier: 'free',
      price: 0,
      features: [
        'Access to free courses',
        'Basic community features',
        'Standard support',
        'Mobile app access'
      ]
    },
    {
      tier: 'premium',
      price: 29,
      features: [
        'All free features',
        'Access to premium courses',
        'Download resources',
        'Priority support',
        'Certificates',
        'Advanced analytics'
      ],
      isPopular: true
    },
    {
      tier: 'elite',
      price: 79,
      features: [
        'All premium features',
        'Access to ALL courses',
        '1-on-1 instructor sessions',
        'Custom learning paths',
        'Private community',
        'Lifetime access guarantee'
      ]
    }
  ];

  const handleSelect = async (tier) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }
    
    // Create subscription logic here
    await base44.entities.Subscription.create({
      user_email: user.email,
      tier: tier,
      status: 'active',
      start_date: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-black text-slate-900">Choose Your Plan</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Start learning Torah with the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.tier}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <PricingCard
                {...plan}
                onSelect={handleSelect}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}