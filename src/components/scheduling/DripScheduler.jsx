import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DripScheduler({ lessons, onSave }) {
  const [dripEnabled, setDripEnabled] = useState(false);
  const [schedule, setSchedule] = useState(
    lessons.map((lesson, idx) => ({
      lesson_id: lesson.id,
      title: lesson.title,
      unlock_days: idx * 7, // Default: 1 lesson per week
      is_locked: idx > 0
    }))
  );

  const updateDays = (lessonId, days) => {
    setSchedule(schedule.map(s => 
      s.lesson_id === lessonId ? { ...s, unlock_days: parseInt(days) || 0 } : s
    ));
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Drip Content Schedule
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Enable Drip</span>
            <Switch checked={dripEnabled} onCheckedChange={setDripEnabled} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!dripEnabled && (
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-sm text-slate-700">
              Enable drip scheduling to release lessons over time
            </p>
          </div>
        )}

        {dripEnabled && (
          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <motion.div
                key={item.lesson_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-600">
                    Unlocks {item.unlock_days} days after enrollment
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={item.unlock_days}
                    onChange={(e) => updateDays(item.lesson_id, e.target.value)}
                    className="w-20 rounded-xl"
                    placeholder="0"
                  />
                  <span className="text-sm text-slate-600">days</span>
                </div>
                {item.unlock_days === 0 ? (
                  <Badge className="bg-green-100 text-green-800">
                    <Unlock className="w-3 h-3 mr-1" />
                    Available Now
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-700">Locked</Badge>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {dripEnabled && (
          <Button
            onClick={() => onSave?.(schedule)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
          >
            Save Schedule
          </Button>
        )}
      </CardContent>
    </Card>
  );
}