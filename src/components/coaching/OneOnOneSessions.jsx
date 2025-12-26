import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Calendar, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OneOnOneSessions({ instructorId }) {
  const sessions = [
    {
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      instructor: 'Rabbi Cohen',
      topic: 'Personalized Torah study plan',
      duration: 30,
      status: 'upcoming'
    },
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      instructor: 'Rabbi Levy',
      topic: 'Hebrew pronunciation practice',
      duration: 45,
      status: 'completed'
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Video className="w-5 h-5 text-purple-600" />
          <div>
            <div>1-on-1 Sessions</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">מפגשים אישיים</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border-2 ${
              session.status === 'upcoming' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-slate-900">{session.topic}</div>
                <div className="text-sm text-slate-600">with {session.instructor}</div>
              </div>
              <Badge className={
                session.status === 'upcoming' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-600 text-white'
              }>
                {session.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {session.date.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {session.duration} min
              </div>
            </div>

            {session.status === 'upcoming' && (
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
              >
                <Video className="w-4 h-4 mr-2" />
                Join Session
              </Button>
            )}
          </div>
        ))}

        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl">
          Book New Session
        </Button>
      </CardContent>
    </Card>
  );
}