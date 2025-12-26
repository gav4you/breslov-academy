import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookmarkManager() {
  const [bookmarks, setBookmarks] = useState([
    { id: 1, title: 'Likutey Moharan I:1', course: 'Breslov Philosophy', timestamp: '12:45' },
    { id: 2, title: 'Talmud Berachot 2a', course: 'Talmud Study', timestamp: '08:20' },
    { id: 3, title: 'Zohar Bereishit', course: 'Kabbalah Course', timestamp: '25:10' },
  ]);

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          My Bookmarks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {bookmarks.map((bookmark, idx) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-md group"
            >
              <Bookmark className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">{bookmark.title}</div>
                <div className="text-xs text-slate-600">{bookmark.course} • {bookmark.timestamp}</div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => removeBookmark(bookmark.id)}
                  variant="ghost"
                  size="icon"
                  className="rounded-lg text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}