import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyPlanner() {
  const [schedule] = useState([
    { day: 'Monday', time: '8:00 PM', topic: 'Talmud Berachot', duration: '1 hour' },
    { day: 'Wednesday', time: '7:30 PM', topic: 'Likutey Moharan', duration: '45 min' },
    { day: 'Friday', time: '4:00 PM', topic: 'Parsha Review', duration: '30 min' },
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-pink-600" />
          Study Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedule.map((session, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-black text-slate-900">{session.topic}</div>
                <div className="text-sm text-slate-600">{session.day}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{session.time}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.duration}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <Button variant="outline" className="w-full rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Study Session
        </Button>
      </CardContent>
    </Card>
  );
}