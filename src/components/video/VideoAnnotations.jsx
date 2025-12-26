import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function VideoAnnotations({ currentTime, onJumpTo }) {
  const [annotations, setAnnotations] = useState([
    { time: 45, text: 'Important point about finding good', author: 'You' },
    { time: 180, text: 'Question: How to apply daily?', author: 'Moshe L.' }
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');

  const addAnnotation = () => {
    if (newAnnotation.trim()) {
      setAnnotations([...annotations, {
        time: Math.floor(currentTime),
        text: newAnnotation,
        author: 'You'
      }]);
      setNewAnnotation('');
    }
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900">Annotations</h3>
        </div>

        <div className="flex gap-2">
          <Input
            value={newAnnotation}
            onChange={(e) => setNewAnnotation(e.target.value)}
            placeholder="Add note at current time..."
            className="flex-1 rounded-xl"
          />
          <Button
            onClick={addAnnotation}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {annotations.map((annotation, idx) => (
            <div
              key={idx}
              onClick={() => onJumpTo?.(annotation.time)}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {Math.floor(annotation.time / 60)}:{(annotation.time % 60).toString().padStart(2, '0')}
                </Badge>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              </div>
              <p className="text-sm text-slate-700">{annotation.text}</p>
              <div className="text-xs text-slate-500 mt-1">{annotation.author}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}