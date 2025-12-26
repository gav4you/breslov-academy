import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TfilahTracker() {
  const [prayers, setPrayers] = useState([
    { name: 'Shacharit', hebrew: 'שחרית', completed: true },
    { name: 'Mincha', hebrew: 'מנחה', completed: true },
    { name: 'Maariv', hebrew: 'מעריב', completed: false },
  ]);

  const togglePrayer = (index) => {
    const updated = [...prayers];
    updated[index].completed = !updated[index].completed;
    setPrayers(updated);
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Daily Prayers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {prayers.map((prayer, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ x: 4 }}
            onClick={() => togglePrayer(idx)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all ${
              prayer.completed
                ? 'bg-gradient-to-r from-green-50 to-emerald-50'
                : 'bg-white'
            }`}
          >
            {prayer.completed ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Circle className="w-6 h-6 text-slate-400" />
            )}
            <div className="flex-1 text-left">
              <div className="font-bold text-slate-900">{prayer.name}</div>
              <div className="text-sm text-slate-600" dir="rtl">{prayer.hebrew}</div>
            </div>
          </motion.button>
        ))}

        <div className="pt-4 border-t border-slate-200 text-center">
          <div className="text-sm text-slate-600">
            {prayers.filter(p => p.completed).length} of {prayers.length} completed
          </div>
        </div>
      </CardContent>
    </Card>
  );
}