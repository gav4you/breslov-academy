import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, DollarSign, Users, TrendingUp, Copy, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function AffiliateProgram({ userEmail }) {
  const [affiliateCode, setAffiliateCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadAffiliate = async () => {
      const affiliates = await base44.entities.Affiliate.filter({ user_email: userEmail });
      if (affiliates.length > 0) {
        setAffiliateCode(affiliates[0].referral_code);
      } else {
        // Generate new code
        const code = `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        await base44.entities.Affiliate.create({
          user_email: userEmail,
          referral_code: code,
          commission_rate: 0.20, // 20%
          total_earnings: 0,
          total_referrals: 0
        });
        setAffiliateCode(code);
      }
    };
    
    if (userEmail) loadAffiliate();
  }, [userEmail]);

  const affiliateLink = `${window.location.origin}?ref=${affiliateCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Affiliate Program</h2>
              <p className="text-slate-600">Earn 20% commission on every referral</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-900">$0</div>
                <div className="text-sm text-slate-600">Total Earnings</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-900">0</div>
                <div className="text-sm text-slate-600">Referrals</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-black text-slate-900">20%</div>
                <div className="text-sm text-slate-600">Commission</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={affiliateLink}
                readOnly
                className="flex-1 rounded-xl font-mono text-sm"
              />
              <Button
                onClick={copyLink}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              Share this link with friends and earn commission on their course purchases
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-4">How It Works</h3>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Share Your Link', desc: 'Share your unique referral link with friends and followers' },
              { step: 2, title: 'They Sign Up', desc: 'When someone enrolls using your link, you earn commission' },
              { step: 3, title: 'Get Paid', desc: 'Receive 20% of every course purchase they make' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-600">{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}