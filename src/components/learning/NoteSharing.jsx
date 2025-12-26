import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Download, Eye, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NoteSharing({ sharedNotes = [] }) {
  const [notes] = useState([
    {
      id: 1,
      author: 'Rabbi Cohen',
      lesson: 'Likutey Moharan Torah 1',
      title: 'Understanding the Concept of Azamra',
      preview: 'The teaching to judge everyone favorably, including oneself...',
      likes: 24,
      views: 156,
      downloads: 12,
      isInstructor: true
    },
    {
      id: 2,
      author: 'Moshe L.',
      lesson: 'Talmud - Berachot 2a',
      title: 'Key Distinctions in Evening Shema',
      preview: 'The gemara discusses three opinions regarding the time...',
      likes: 18,
      views: 89,
      downloads: 7,
      isInstructor: false
    },
    {
      id: 3,
      author: 'David K.',
      lesson: 'Kabbalah Foundations',
      title: 'The Ten Sefirot Simplified',
      preview: 'A practical framework for understanding the spiritual worlds...',
      likes: 31,
      views: 203,
      downloads: 19,
      isInstructor: false
    }
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Share2 className="w-5 h-5 text-green-600" />
          <div>
            <div>Shared Study Notes</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">הערות משותפות</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.map((note, idx) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{note.author}</span>
                  {note.isInstructor && (
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      Instructor
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-600">{note.lesson}</div>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 mb-2">{note.title}</h4>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">{note.preview}</p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {note.views}
              </div>
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {note.likes}
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {note.downloads}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}