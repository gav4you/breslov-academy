import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoNotes({ currentTime }) {
  const [notes, setNotes] = useState([
    { time: '05:30', text: 'Key concept: Simcha as spiritual practice', id: 1 },
    { time: '12:15', text: 'Question about hitbodedut timing', id: 2 },
  ]);
  const [newNote, setNewNote] = useState('');

  const addNote = () => {
    if (newNote.trim()) {
      setNotes([...notes, {
        time: currentTime || '00:00',
        text: newNote,
        id: Date.now()
      }]);
      setNewNote('');
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-600" />
          Video Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Take a note at this moment..."
            className="min-h-[80px] rounded-xl"
          />
          <Button
            onClick={addNote}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Note at {currentTime || '00:00'}
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3 h-3 text-yellow-700" />
                  <span className="text-xs font-bold text-yellow-900">{note.time}</span>
                </div>
                <p className="text-sm text-slate-700">{note.text}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}