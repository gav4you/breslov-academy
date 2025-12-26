import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Users, TrendingUp, MessageCircle, ThumbsUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export default function LiveAnalytics({ courseId }) {
  const [liveData, setLiveData] = useState({
    activeNow: 8,
    watchingVideo: 5,
    inDiscussions: 3,
    completedToday: 12,
    avgEngagement: 87
  });

  const [activityHistory, setActivityHistory] = useState([
    { time: '10:00', active: 3 },
    { time: '11:00', active: 5 },
    { time: '12:00', active: 7 },
    { time: '13:00', active: 12 },
    { time: '14:00', active: 8 },
    { time: '15:00', active: 10 },
    { time: '16:00', active: 8 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeNow: prev.activeNow + Math.floor(Math.random() * 3) - 1
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <div>Live Analytics</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">ניתוח חי</div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 animate-pulse">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="p-4 bg-green-50 rounded-xl border border-green-200 text-center"
          >
            <Eye className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{liveData.activeNow}</div>
            <div className="text-xs text-slate-600">Active Now</div>
          </motion.div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{liveData.watchingVideo}</div>
            <div className="text-xs text-slate-600">Watching</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
            <MessageCircle className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{liveData.inDiscussions}</div>
            <div className="text-xs text-slate-600">Discussing</div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
            <ThumbsUp className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{liveData.completedToday}</div>
            <div className="text-xs text-slate-600">Completed</div>
          </div>

          <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-slate-900">{liveData.avgEngagement}%</div>
            <div className="text-xs text-slate-600">Engagement</div>
          </div>
        </div>

        <div>
          <div className="text-sm font-bold text-slate-700 mb-3">Activity Today</div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={activityHistory}>
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-900 font-serif">
            📊 <strong>Peak time:</strong> 1-2 PM is when most students are active. Schedule live sessions then for maximum engagement.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}