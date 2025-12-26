import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video } from 'lucide-react';
import { motion } from 'framer-motion';
import WebinarRegistration from '../components/webinars/WebinarRegistration';

export default function Webinars() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: webinars = [] } = useQuery({
    queryKey: ['webinars'],
    queryFn: () => base44.entities.LiveClass.filter({ class_type: 'webinar' }, '-scheduled_date')
  });

  const registerMutation = useMutation({
    mutationFn: (webinarId) => base44.entities.Event.create({
      user_email: user.email,
      event_id: webinarId,
      event_type: 'webinar',
      status: 'registered'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['webinars']);
    }
  });

  const upcomingWebinars = webinars.filter(w => new Date(w.scheduled_date) > new Date());
  const pastWebinars = webinars.filter(w => new Date(w.scheduled_date) <= new Date());

  return (
    <div className="min-h-screen gradient-mesh bg-slate-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl">
              <Video className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900">Live Webinars</h1>
              <p className="text-xl text-slate-600">Join expert-led sessions in real-time</p>
            </div>
          </div>
        </motion.div>

        {upcomingWebinars.length > 0 && (
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Upcoming Webinars</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingWebinars.map((webinar, idx) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <WebinarRegistration
                    webinar={webinar}
                    onRegister={(id) => registerMutation.mutate(id)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {pastWebinars.length > 0 && (
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-6">Past Webinars (Recordings)</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {pastWebinars.map((webinar, idx) => (
                <motion.div
                  key={webinar.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div className="p-4 bg-white rounded-xl hover:shadow-md transition-all cursor-pointer">
                    <div className="font-bold text-slate-900 mb-1">{webinar.title}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(webinar.scheduled_date).toLocaleDateString()}
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3 rounded-xl">
                      Watch Recording
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}