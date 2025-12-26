import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Video, Mic, MessageCircle, BookOpen, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VirtualBeitMidrash() {
  const [activeRooms, setActiveRooms] = useState([
    {
      id: 1,
      name: 'Gemara Study - Berachot',
      participants: 4,
      topic: 'Daf 2a',
      host: 'Rabbi Cohen',
      isLive: true,
      hasAudio: true,
      hasVideo: true
    },
    {
      id: 2,
      name: 'Likutey Moharan Deep Dive',
      participants: 6,
      topic: 'Torah 1',
      host: 'David L.',
      isLive: true,
      hasAudio: true,
      hasVideo: false
    },
    {
      id: 3,
      name: 'Hebrew Practice Circle',
      participants: 3,
      topic: 'Conversational Hebrew',
      host: 'Sarah M.',
      isLive: true,
      hasAudio: true,
      hasVideo: true
    }
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <div>
              <div>Virtual Beit Midrash</div>
              <div className="text-sm text-slate-600 font-normal" dir="rtl">בית מדרש וירטואלי</div>
            </div>
          </div>
          <Badge className="bg-green-100 text-green-800 animate-pulse">
            {activeRooms.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-sm text-purple-900 font-serif leading-relaxed">
            "Two scholars who engage in Torah study together, the Divine Presence dwells between them"
          </div>
        </div>

        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Create New Study Room
        </Button>

        <div className="space-y-3">
          {activeRooms.map((room, idx) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-black text-slate-900 mb-1">{room.name}</div>
                  <div className="text-sm text-slate-600">
                    Hosted by {room.host}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                  Live
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Badge variant="outline" className="text-xs">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {room.topic}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {room.participants}
                </Badge>
              </div>

              <div className="flex gap-2 mb-3">
                {room.hasVideo && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Video className="w-3 h-3 mr-1" />
                    Video
                  </Badge>
                )}
                {room.hasAudio && (
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    <Mic className="w-3 h-3 mr-1" />
                    Audio
                  </Badge>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Room
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-900 font-serif">
            💡 <strong>Tip:</strong> Study rooms support screen sharing, whiteboard, and text highlighting for collaborative learning
          </div>
        </div>
      </CardContent>
    </Card>
  );
}