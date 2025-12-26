import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CrosswordPuzzle() {
  const [answers, setAnswers] = useState({});

  const clues = {
    across: [
      { number: 1, clue: 'Peace (Hebrew)', answer: 'SHALOM', row: 0, col: 0 },
      { number: 3, clue: 'Torah teaching', answer: 'TORAH', row: 2, col: 1 }
    ],
    down: [
      { number: 2, clue: 'Wisdom', answer: 'CHOCHMAH', row: 0, col: 2 }
    ]
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif">
          <Grid className="w-5 h-5 text-blue-600" />
          Torah Crossword
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-8 gap-0.5 bg-slate-900 p-0.5 rounded-xl">
          {Array(8).fill(null).map((_, i) =>
            Array(8).fill(null).map((_, j) => (
              <div
                key={`${i}-${j}`}
                className="aspect-square bg-white flex items-center justify-center"
              >
                <input
                  type="text"
                  maxLength={1}
                  className="w-full h-full text-center font-bold text-slate-900 uppercase focus:bg-blue-50 outline-none"
                />
              </div>
            ))
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-slate-900 mb-2">Across</div>
            {clues.across.map(clue => (
              <div key={clue.number} className="text-sm text-slate-700 mb-1">
                {clue.number}. {clue.clue}
              </div>
            ))}
          </div>
          <div>
            <div className="font-bold text-slate-900 mb-2">Down</div>
            {clues.down.map(clue => (
              <div key={clue.number} className="text-sm text-slate-700 mb-1">
                {clue.number}. {clue.clue}
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
          <CheckCircle className="w-4 h-4 mr-2" />
          Check Answers
        </Button>
      </CardContent>
    </Card>
  );
}