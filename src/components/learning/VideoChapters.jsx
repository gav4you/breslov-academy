import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoChapters({ chapters, currentTime, onSeek }) {
  const mockChapters = chapters || [
    { title: 'Introduction', time: '0:00', duration: '5:30' },
    { title: 'Main Teaching', time: '5:30', duration: '15:45' },
    { title: 'Practical Application', time: '21:15', duration: '8:20' },
    { title: 'Q&A Session', time: '29:35', duration: '10:15' },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <List className="w-5 h-5 text-slate-600" />
          Chapters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {mockChapters.map((chapter, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ x: 4 }}
            onClick={() => onSeek?.(chapter.time)}
            className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:bg-blue-50 transition-colors text-left"
          >
            <Play className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900 text-sm truncate">{chapter.title}</div>
              <div className="text-xs text-slate-600">{chapter.duration}</div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{chapter.time}</span>
          </motion.button>
        ))}
      </CardContent>
    </Card>
  );
}