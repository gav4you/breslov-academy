import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, X, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchHistory() {
  const [history, setHistory] = useState([
    'Breslov philosophy',
    'Hitbodedut practice',
    'Talmud Berachot',
    'Daily prayers',
  ]);

  const removeItem = (index) => {
    setHistory(history.filter((_, i) => i !== index));
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          Recent Searches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {history.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2 flex-1 cursor-pointer">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
              <button
                onClick={() => removeItem(idx)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}