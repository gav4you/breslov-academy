import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid3x3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CrosswordPuzzle() {
  const grid = [
    ['T', '', 'R', '', 'H'],
    ['O', 'R', 'A', 'H', ''],
    ['', '', 'B', '', ''],
    ['', '', 'B', '', ''],
    ['', '', 'I', '', ''],
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-indigo-600" />
          Torah Crossword
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1 mb-4">
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (i * 5 + j) * 0.02 }}
              >
                {cell ? (
                  <input
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center font-bold text-xl border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
                    defaultValue={cell === cell.toUpperCase() ? '' : cell}
                  />
                ) : (
                  <div className="w-12 h-12 bg-slate-900 rounded-lg" />
                )}
              </motion.div>
            ))
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div><span className="font-bold">1 Across:</span> Five Books of Moses (5)</div>
          <div><span className="font-bold">2 Down:</span> Jewish law (6)</div>
        </div>
      </CardContent>
    </Card>
  );
}