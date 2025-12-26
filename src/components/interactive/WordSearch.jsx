import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WordSearch() {
  const grid = [
    ['T', 'O', 'R', 'A', 'H', 'X'],
    ['A', 'M', 'U', 'N', 'A', 'H'],
    ['L', 'S', 'I', 'M', 'C', 'H'],
    ['M', 'I', 'T', 'Z', 'V', 'A'],
    ['U', 'D', 'K', 'E', 'S', 'H'],
    ['D', 'A', 'V', 'E', 'N', 'E'],
  ];

  const words = ['TORAH', 'EMUNAH', 'SIMCHA', 'MITZVAH', 'TALMUD'];
  const [found, setFound] = useState([]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-indigo-600" />
          Hebrew Word Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-6 gap-2">
          {grid.map((row, i) =>
            row.map((letter, j) => (
              <motion.button
                key={`${i}-${j}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl rounded-lg shadow-md hover:shadow-xl transition-all"
              >
                {letter}
              </motion.button>
            ))
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-bold text-slate-900">Find these words:</h4>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <div
                key={word}
                className={`px-3 py-1 rounded-lg font-medium ${
                  found.includes(word)
                    ? 'bg-green-100 text-green-800 line-through'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}