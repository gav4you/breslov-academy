import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Search, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function TranscriptViewer({ transcript = [], onJumpTo }) {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleTranscript = transcript.length > 0 ? transcript : [
    { time: 0, speaker: 'Rabbi Cohen', text: 'Welcome to our study of Azamra...' },
    { time: 45, speaker: 'Rabbi Cohen', text: 'The concept teaches us to find the good point...' },
    { time: 120, speaker: 'Rabbi Cohen', text: 'Even in the most challenging people...' }
  ];

  const filteredTranscript = sampleTranscript.filter(line =>
    line.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <div>Transcript</div>
            <div className="text-sm text-slate-600 font-normal" dir="rtl">תמליל</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transcript..."
            className="pl-10 rounded-xl"
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTranscript.map((line, idx) => (
            <div
              key={idx}
              onClick={() => onJumpTo?.(line.time)}
              className="p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <Play className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {Math.floor(line.time / 60)}:{(line.time % 60).toString().padStart(2, '0')}
                    </Badge>
                    <span className="text-xs font-bold text-slate-600">{line.speaker}</span>
                  </div>
                  <p className="text-sm text-slate-700">{line.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}