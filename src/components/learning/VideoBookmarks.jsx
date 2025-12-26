import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Play, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function VideoBookmarks({ bookmarks = [], currentTime, onJumpTo, onAdd, onDelete }) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  const addBookmark = () => {
    if (title) {
      onAdd?.({
        timestamp: Math.floor(currentTime),
        title,
        note,
        created: new Date().toISOString()
      });
      setTitle('');
      setNote('');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-900">Video Bookmarks</h3>
          </div>
          <Badge className="bg-amber-100 text-amber-800">
            {bookmarks.length}
          </Badge>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bookmark title..."
            className="rounded-lg"
          />
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)..."
            className="rounded-lg"
          />
          <Button
            onClick={addBookmark}
            disabled={!title}
            className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Save at {formatTime(currentTime || 0)}
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bookmark className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No bookmarks yet</p>
            </div>
          ) : (
            bookmarks.map((bookmark, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm">{bookmark.title}</div>
                    {bookmark.note && (
                      <div className="text-xs text-slate-600 mt-1">{bookmark.note}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onJumpTo?.(bookmark.timestamp)}
                      className="h-8 w-8 p-0"
                    >
                      <Play className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(idx)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {formatTime(bookmark.timestamp)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}