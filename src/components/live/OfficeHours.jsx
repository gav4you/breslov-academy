import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Users, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OfficeHours({ sessions, instructorName, onJoin, onRemind }) {
  const [reminded, setReminded] = useState({});

  const handleRemind = (sessionId) => {
    setReminded({ ...reminded, [sessionId]: true });
    onRemind?.(sessionId);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5 text-blue-600" />
          Live Office Hours with {instructorName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions?.map((session, idx) => {
          const isLive = session.status === 'live';
          const isUpcoming = new Date(session.scheduled_time) > new Date();

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`p-4 rounded-xl ${
                isLive ? 'bg-red-50 border-2 border-red-500' : 'bg-white'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-slate-900">{session.topic}</h4>
                      {isLive && (
                        <Badge className="bg-red-500 text-white animate-pulse">
                          LIVE NOW
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(session.scheduled_time).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(session.scheduled_time).toLocaleTimeString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.attendees_count || 0} joined
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isLive ? (
                    <Button
                      onClick={() => onJoin?.(session.id)}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Now
                    </Button>
                  ) : isUpcoming ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleRemind(session.id)}
                        disabled={reminded[session.id]}
                        className="rounded-xl"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        {reminded[session.id] ? 'Reminder Set' : 'Remind Me'}
                      </Button>
                      <Button
                        onClick={() => onJoin?.(session.id)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
                      >
                        Add to Calendar
                      </Button>
                    </>
                  ) : (
                    <Badge variant="outline">Past Session</Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {(!sessions || sessions.length === 0) && (
          <div className="text-center py-8 text-slate-500">
            No office hours scheduled yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}