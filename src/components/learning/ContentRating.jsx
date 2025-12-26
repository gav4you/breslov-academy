import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentRating({ onRate }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (value) => {
    setRating(value);
    setSubmitted(true);
    onRate?.(value);
  };

  if (submitted) {
    return (
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            <ThumbsUp className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Thank you!</h3>
            <p className="text-slate-600">Your feedback helps us improve</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 text-center">
          How would you rate this content?
        </h3>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleRate(value)}
            >
              <Star
                className={`w-10 h-10 transition-colors ${
                  value <= (hover || rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                }`}
              />
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-slate-600 text-center">Click a star to rate</p>
      </CardContent>
    </Card>
  );
}