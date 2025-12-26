import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Users, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebinarRegistration({ webinar, onRegister }) {
  const [registered, setRegistered] = useState(false);

  const handleRegister = () => {
    onRegister?.(webinar.id);
    setRegistered(true);
  };

  const attendeeCount = webinar.registered_count || 0;
  const spotsLeft = webinar.max_attendees ? webinar.max_attendees - attendeeCount : null;

  return (
    <Card className="card-modern border-white/60 premium-shadow hover:premium-shadow-lg transition-all rounded-[2rem] overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative flex items-center justify-center">
        <Video className="w-20 h-20 text-white/20 absolute" />
        <Badge className="absolute top-4 left-4 bg-red-500 text-white">
          LIVE WEBINAR
        </Badge>
        {spotsLeft && spotsLeft < 10 && (
          <Badge className="absolute top-4 right-4 bg-amber-500 text-white animate-pulse">
            {spotsLeft} spots left!
          </Badge>
        )}
      </div>

      <CardContent className="p-8 space-y-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">{webinar.title}</h3>
          <p className="text-slate-600">{webinar.description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-slate-700">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>{new Date(webinar.scheduled_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>{new Date(webinar.scheduled_date).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{attendeeCount} registered</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <Video className="w-5 h-5 text-blue-600" />
            <span>Hosted by {webinar.instructor_name}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <h4 className="font-bold text-slate-900 mb-2">What You'll Learn:</h4>
          <ul className="space-y-1 text-sm text-slate-700">
            {webinar.learning_objectives?.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        {registered ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-green-900 mb-1">You're Registered!</div>
            <div className="text-sm text-green-700">
              We'll send you a reminder before the webinar starts
            </div>
          </div>
        ) : (
          <Button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-6 rounded-2xl"
          >
            <Bell className="w-5 h-5 mr-2" />
            Register for Free
          </Button>
        )}
      </CardContent>
    </Card>
  );
}