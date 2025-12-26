import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TranscriptViewer({ transcript }) {
  const [searchTerm, setSearchTerm] = useState('');

  const mockTranscript = transcript || [
    { time: '0:00', text: 'Welcome to today\'s shiur on Likutey Moharan.' },
    { time: '0:15', text: 'We will explore the concept of simcha in Jewish practice.' },
    { time: '0:45', text: 'Rebbe Nachman teaches us that joy is a great mitzvah.' },
    { time: '1:20', text: 'Let us understand the deeper meaning of this teaching.' },
  ];

  const filteredTranscript = mockTranscript.filter(item =>
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          Transcript
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

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {filteredTranscript.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer"
            >
              <span className="text-xs font-bold text-blue-600 flex-shrink-0 w-12">
                {item.time}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}