import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollaborativeNotes() {
  const [notes] = useState([
    { user: 'Sarah', text: 'Key insight: Simcha is not just happiness but a spiritual obligation', likes: 12, viewers: 3 },
    { user: 'David', text: 'Important: Connection between hitbodedut and personal growth', likes: 8, viewers: 5 },
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          Shared Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.map((note, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 bg-white rounded-xl shadow-md"
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {note.user[0]}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">{note.user}</div>
                <p className="text-slate-700 text-sm mt-1">{note.text}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>❤️ {note.likes}</span>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{note.viewers}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}