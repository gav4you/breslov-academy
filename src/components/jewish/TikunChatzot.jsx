import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function TikunChatzot() {
  const [isChatzotTime, setIsChatzotTime] = useState(false);
  const [minutesToChatzot, setMinutesToChatzot] = useState(0);

  useEffect(() => {
    const checkChatzot = () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Chatzot is around midnight to 2 AM
      const isTime = hour >= 0 && hour < 2;
      setIsChatzotTime(isTime);
      
      if (!isTime && hour < 24) {
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0);
        const diff = midnight - now;
        setMinutesToChatzot(Math.floor(diff / 60000));
      }
    };

    checkChatzot();
    const interval = setInterval(checkChatzot, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!isChatzotTime && minutesToChatzot > 120) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={isChatzotTime ? 'fixed bottom-4 right-4 z-50' : ''}
    >
      <Card className={`bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-2 ${
        isChatzotTime ? 'border-purple-300 shadow-2xl' : 'border-purple-200'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Moon className={`w-8 h-8 text-purple-300 ${isChatzotTime ? 'animate-pulse' : ''}`} />
            <div>
              <div className="font-black text-white text-lg">Tikun Chatzot</div>
              <div className="text-purple-300 font-serif text-sm" dir="rtl">תיקון חצות</div>
            </div>
          </div>

          {isChatzotTime ? (
            <>
              <div className="text-white/90 text-sm mb-4">
                This is a special time for Torah study and prayer. The Breslov tradition emphasizes midnight learning for spiritual elevation.
              </div>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl">
                <Star className="w-4 h-4 mr-2" />
                Begin Midnight Study
              </Button>
            </>
          ) : (
            <div className="text-purple-200 text-sm">
              <Clock className="w-4 h-4 inline mr-2" />
              Chatzot in {minutesToChatzot} minutes
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}