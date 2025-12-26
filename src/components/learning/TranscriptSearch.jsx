import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TranscriptSearch({ transcript = [], onJumpTo }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    const found = transcript.filter(item => 
      item.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(found);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600" />
          <h3 className="font-black text-slate-900">Search Transcript</h3>
        </div>

        <div className="flex gap-2">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search in shiur..."
            className="flex-1 rounded-xl"
          />
          <Button
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <div className="text-sm text-slate-600 mb-2">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </div>
            {results.map((result, idx) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
                onClick={() => onJumpTo?.(result.timestamp)}
              >
                <div className="flex items-start gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                  >
                    <Play className="w-4 h-4 text-blue-600" />
                  </Button>
                  <div className="flex-1">
                    <div className="text-sm text-slate-700 mb-1">
                      {result.text}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.floor(result.timestamp / 60)}:{(result.timestamp % 60).toString().padStart(2, '0')}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {searchTerm && results.length === 0 && (
          <div className="text-center py-6 text-slate-500">
            No results found for "{searchTerm}"
          </div>
        )}
      </CardContent>
    </Card>
  );
}