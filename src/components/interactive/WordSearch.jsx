import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award } from 'lucide-react';

export default function WordSearch({ words = [] }) {
  const [found, setFound] = useState([]);
  
  const hebrewWords = words.length > 0 ? words : ['שלום', 'תורה', 'חכמה', 'אמונה'];
  const gridSize = 10;
  
  const grid = Array(gridSize).fill(null).map(() => 
    Array(gridSize).fill(null).map(() => 
      String.fromCharCode(1488 + Math.floor(Math.random() * 22))
    )
  );

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge className="bg-purple-100 text-purple-800">Word Search</Badge>
          <Badge className="bg-green-100 text-green-800">
            {found.length} / {hebrewWords.length}
          </Badge>
        </div>

        <div className="grid grid-cols-10 gap-1" dir="rtl">
          {grid.map((row, i) => 
            row.map((letter, j) => (
              <div
                key={`${i}-${j}`}
                className="aspect-square bg-blue-50 rounded flex items-center justify-center font-bold text-slate-900 cursor-pointer hover:bg-blue-100"
              >
                {letter}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-bold text-slate-700">Find these words:</div>
          <div className="flex flex-wrap gap-2">
            {hebrewWords.map((word, idx) => (
              <Badge
                key={idx}
                className={found.includes(word) ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-700'}
              >
                {word}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}