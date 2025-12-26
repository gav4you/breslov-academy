import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) setIsVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="max-w-4xl mx-auto glass-morphism rounded-2xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <Cookie className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2">We use cookies</h3>
                <p className="text-sm text-slate-700 mb-4">
                  We use cookies to enhance your learning experience and analyze site usage.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={acceptCookies}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                  >
                    Accept All
                  </Button>
                  <Button variant="outline" className="rounded-xl">
                    Customize
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}