import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function MembershipTiers({ currentTier = 'free' }) {
  const tiers = [
    {
      name: 'Free',
      price: 0,
      icon: Star,
      color: 'from-slate-400 to-slate-600',
      features: [
        'Access to free courses',
        'Basic flashcards',
        'Community forums',
        'Weekly wisdom emails'
      ]
    },
    {
      name: 'Premium',
      price: 29,
      icon: Crown,
      color: 'from-blue-400 to-blue-600',
      features: [
        'All Free features',
        'Premium courses library',
        'AI study assistant',
        'Live shiurim access',
        'Download resources',
        'Certificate of completion'
      ],
      popular: true
    },
    {
      name: 'Elite',
      price: 99,
      icon: Zap,
      color: 'from-amber-400 to-amber-600',
      features: [
        'All Premium features',
        'Unlimited AI tutoring',
        '1-on-1 with instructors',
        'Exclusive masterclasses',
        'Priority support',
        'Custom learning paths'
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tiers.map((tier, idx) => {
        const Icon = tier.icon;
        const isCurrent = tier.name.toLowerCase() === currentTier;
        
        return (
          <Card
            key={idx}
            className={`glass-effect border-0 premium-shadow-lg rounded-[2rem] ${
              tier.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <CardContent className="p-8 space-y-6">
              {tier.popular && (
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              )}

              <div className="text-center">
                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-2xl font-black text-slate-900 mb-2">{tier.name}</div>
                <div className="text-5xl font-black text-slate-900 mb-2">
                  ${tier.price}
                  <span className="text-lg text-slate-600">/mo</span>
                </div>
              </div>

              <div className="space-y-3">
                {tier.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                disabled={isCurrent}
                className={`w-full rounded-2xl ${
                  isCurrent 
                    ? 'bg-slate-300 text-slate-600' 
                    : `bg-gradient-to-r ${tier.color} text-white`
                }`}
              >
                {isCurrent ? 'Current Plan' : 'Upgrade'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}