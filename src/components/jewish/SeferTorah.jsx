import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Volume2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SeferTorah() {
  const [searchVerse, setSearchVerse] = useState('');
  const [selectedBook, setSelectedBook] = useState('Genesis');

  const books = [
    { name: 'Genesis', hebrew: 'בראשית', chapters: 50 },
    { name: 'Exodus', hebrew: 'שמות', chapters: 40 },
    { name: 'Leviticus', hebrew: 'ויקרא', chapters: 27 },
    { name: 'Numbers', hebrew: 'במדבר', chapters: 36 },
    { name: 'Deuteronomy', hebrew: 'דברים', chapters: 34 }
  ];

  const currentBook = books.find(b => b.name === selectedBook);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2.5rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <div>
            <div>Sefer Torah Navigator</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">ספר תורה</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchVerse}
            onChange={(e) => setSearchVerse(e.target.value)}
            placeholder="Search verse or chapter..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="grid grid-cols-5 gap-2">
          {books.map((book, idx) => (
            <Button
              key={idx}
              onClick={() => setSelectedBook(book.name)}
              variant={selectedBook === book.name ? 'default' : 'outline'}
              className={`rounded-xl flex flex-col h-auto py-3 ${
                selectedBook === book.name 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
                  : ''
              }`}
            >
              <div className="font-bold text-xs">{book.name}</div>
              <div className="text-xs opacity-80" dir="rtl">{book.hebrew}</div>
            </Button>
          ))}
        </div>

        {currentBook && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-black text-slate-900 text-xl">{currentBook.name}</div>
                <div className="text-amber-700 font-serif" dir="rtl">{currentBook.hebrew}</div>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {currentBook.chapters} chapters
              </Badge>
            </div>

            <div className="grid grid-cols-10 gap-2">
              {[...Array(currentBook.chapters)].map((_, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="rounded-lg aspect-square p-0"
                >
                  {idx + 1}
                </Button>
              ))}
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl">
              <BookOpen className="w-4 h-4 mr-2" />
              Open {currentBook.name} Chapter 1
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}