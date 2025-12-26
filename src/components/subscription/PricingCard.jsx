import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingCard({ tier, price, features, isPopular, onSelect }) {
  const icons = {
    free: Star,
    premium: Crown,
    elite: Crown
  };

  const Icon = icons[tier] || Star;

  const colors = {
    free: 'from-slate-500 to-slate-600',
    premium: 'from-blue-500 to-blue-600',
    elite: 'from-amber-500 to-amber-600'
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: isPopular ? 1.02 : 1.0 }}
      className={isPopular ? 'relative' : ''}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white z-10">
          Most Popular
        </Badge>
      )}
      
      <Card className={`card-modern border-white/60 premium-shadow hover:premium-shadow-xl transition-all rounded-[2rem] overflow-hidden h-full ${
        isPopular ? 'border-4 border-amber-500' : ''
      }`}>
        <div className={`h-2 bg-gradient-to-r ${colors[tier]}`} />
        <CardContent className="p-8 space-y-6">
          <div className="text-center">
            <div className={`w-16 h-16 bg-gradient-to-br ${colors[tier]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 capitalize">{tier}</h3>
          </div>

          <div className="text-center">
            <div className="text-5xl font-black text-slate-900">
              ${price}
              <span className="text-lg text-slate-600 font-normal">/month</span>
            </div>
          </div>

          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="p-1 bg-green-100 rounded-lg mt-0.5">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onSelect?.(tier)}
            className={`w-full font-bold rounded-2xl py-6 ${
              isPopular
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white'
            }`}
          >
            Choose {tier}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}