import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookie-consent');
    if (!hasConsented) {
      setTimeout(() => setVisible(true), 2000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 z-50 max-w-2xl mx-auto"
        >
          <Card className="glass-effect border-0 premium-shadow-xl rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Cookie className="w-8 h-8 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-slate-900 mb-2">We use cookies</div>
                  <p className="text-sm text-slate-600 mb-4">
                    We use cookies to enhance your Torah learning experience and analyze site usage.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={accept}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
                    >
                      Accept
                    </Button>
                    <Button
                      onClick={() => setVisible(false)}
                      variant="outline"
                      className="rounded-xl"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}