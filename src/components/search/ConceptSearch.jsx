import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Video, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function ConceptSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const sampleResults = [
    {
      type: 'lesson',
      title: 'Understanding Azamra',
      course: 'Likutey Moharan Volume 1',
      match: 95
    },
    {
      type: 'video',
      title: 'Azamra in Daily Life',
      instructor: 'Rabbi Cohen',
      match: 88
    },
    {
      type: 'discussion',
      title: 'Azamra Discussion Thread',
      replies: 24,
      match: 82
    }
  ];

  const getIcon = (type) => {
    if (type === 'lesson') return BookOpen;
    if (type === 'video') return Video;
    return MessageCircle;
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 2) {
                setResults(sampleResults);
              }
            }}
            placeholder="Search concepts, lessons, discussions..."
            className="pl-12 rounded-xl text-lg h-14"
          />
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, idx) => {
              const Icon = getIcon(result.type);
              
              return (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{result.title}</div>
                      <div className="text-sm text-slate-600">
                        {result.course || result.instructor || `${result.replies} replies`}
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {result.match}% match
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}