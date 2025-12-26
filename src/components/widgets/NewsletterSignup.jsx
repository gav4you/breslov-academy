import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = () => {
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-8 text-center space-y-4">
        {!subscribed ? (
          <>
            <Mail className="w-12 h-12 text-blue-600 mx-auto" />
            <div>
              <div className="text-2xl font-black text-slate-900 mb-2">
                Daily Torah Wisdom
              </div>
              <p className="text-slate-600 mb-4" dir="rtl">
                חכמה יומית מתורת רבי נחמן
              </p>
              <p className="text-sm text-slate-600">
                Get inspiring Breslov teachings delivered to your inbox
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-xl"
              />
              <Button
                onClick={subscribe}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div className="text-2xl font-black text-slate-900 mb-2">
              You're Subscribed!
            </div>
            <p className="text-slate-600">
              Check your inbox for tomorrow's wisdom
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}