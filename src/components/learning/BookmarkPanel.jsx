import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, Trash2, Search, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function BookmarkPanel({ bookmarks = [], onDelete, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookmarks = bookmarks.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem] h-full">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-900">Bookmarks</h3>
          </div>
          <Badge className="bg-amber-100 text-amber-800">
            {bookmarks.length}
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookmarks..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Bookmark className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No bookmarks yet</p>
              <p className="text-sm">Mark important moments while learning</p>
            </div>
          ) : (
            filteredBookmarks.map((bookmark, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-amber-300 transition-all cursor-pointer"
                onClick={() => onNavigate?.(bookmark)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-sm">{bookmark.title}</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {bookmark.timestamp && `${Math.floor(bookmark.timestamp / 60)}:${(bookmark.timestamp % 60).toString().padStart(2, '0')}`}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(bookmark.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
                {bookmark.note && (
                  <p className="text-xs text-slate-600 line-clamp-2">{bookmark.note}</p>
                )}
                {bookmark.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bookmark.tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <Tag className="w-2 h-2 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}