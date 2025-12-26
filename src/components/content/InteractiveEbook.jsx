import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronLeft, ChevronRight, Bookmark, Highlighter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InteractiveEbook({ book }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);

  const sampleBook = {
    title: 'Likutey Moharan - Volume 1',
    totalPages: 250,
    content: [
      { page: 0, text: 'Torah 1: The Teaching of Azamra...' },
      { page: 1, text: 'One must judge every person favorably...' }
    ]
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-xl rounded-[2rem]">
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{sampleBook.title}</div>
            <Badge variant="outline">
              Page {currentPage + 1} of {sampleBook.totalPages}
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        <div className="min-h-[400px] p-8 bg-amber-50 rounded-2xl border-2 border-amber-200">
          <div className="prose prose-lg max-w-none font-serif text-slate-800 leading-relaxed">
            {sampleBook.content[currentPage]?.text}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            variant="outline"
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Highlighter className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={() => setCurrentPage(Math.min(sampleBook.totalPages - 1, currentPage + 1))}
            disabled={currentPage === sampleBook.totalPages - 1}
            variant="outline"
            className="rounded-xl"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}