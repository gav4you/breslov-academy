import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyTimer({ onComplete }) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stop = () => {
    setIsActive(false);
    onComplete?.(seconds);
    setSeconds(0);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-slate-900">Study Timer</h3>
          </div>
          <div className="text-xs text-slate-600" dir="rtl">שעון לימוד</div>
        </div>

        <div className="text-center mb-6">
          <motion.div
            animate={isActive ? { scale: [1, 1.02, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-5xl font-black text-slate-900 font-mono"
          >
            {formatTime(seconds)}
          </motion.div>
        </div>

        <div className="flex gap-2">
          {!isActive ? (
            <Button
              onClick={() => setIsActive(true)}
              size="lg"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsActive(false)}
                variant="outline"
                size="lg"
                className="flex-1 rounded-xl"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
              <Button
                onClick={stop}
                variant="outline"
                size="lg"
                className="flex-1 rounded-xl border-red-200 hover:bg-red-50"
              >
                <Square className="w-5 h-5 mr-2 text-red-600" />
                Finish
              </Button>
            </>
          )}
        </div>

        {seconds > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            {seconds >= 60 && `${Math.floor(seconds / 60)} minutes of focused learning`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}