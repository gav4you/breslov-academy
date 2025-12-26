import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

export default function CouponRedemption({ coursePrice, onApply }) {
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState('');

  const validateCoupon = async () => {
    setValidating(true);
    setError('');
    
    try {
      const coupons = await base44.entities.Coupon.filter({ 
        code: code.toUpperCase(),
        is_active: true 
      });
      
      if (coupons.length > 0) {
        const foundCoupon = coupons[0];
        
        // Check expiration
        if (foundCoupon.expiry_date && new Date(foundCoupon.expiry_date) < new Date()) {
          setError('This coupon has expired');
          return;
        }
        
        // Check usage limit
        if (foundCoupon.max_uses && foundCoupon.times_used >= foundCoupon.max_uses) {
          setError('This coupon has reached its usage limit');
          return;
        }
        
        setCoupon(foundCoupon);
        onApply?.(foundCoupon);
      } else {
        setError('Invalid coupon code');
      }
    } catch (err) {
      setError('Error validating coupon');
    }
    
    setValidating(false);
  };

  const discount = coupon ? 
    (coupon.discount_type === 'percentage' 
      ? coursePrice * (coupon.discount_value / 100)
      : coupon.discount_value
    ) : 0;

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900">Have a Coupon Code?</h3>
        </div>

        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
              setCoupon(null);
            }}
            placeholder="ENTER CODE"
            className="flex-1 rounded-xl uppercase"
            disabled={!!coupon}
          />
          <Button
            onClick={validateCoupon}
            disabled={validating || !code || !!coupon}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl"
          >
            Apply
          </Button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-red-600 text-sm"
            >
              <XCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {coupon && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Coupon Applied!</span>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700">Original Price:</span>
                  <span className="text-slate-400 line-through">${coursePrice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-700">Discount:</span>
                  <span className="text-green-600 font-bold">-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="font-bold text-slate-900">Final Price:</span>
                  <span className="text-2xl font-black text-green-600">
                    ${(coursePrice - discount).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setCoupon(null);
                  setCode('');
                  onApply?.(null);
                }}
                variant="outline"
                size="sm"
                className="w-full rounded-xl"
              >
                Remove Coupon
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}