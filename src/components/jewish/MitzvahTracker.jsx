import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Plus, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MitzvahTracker() {
  const [mitzvot, setMitzvot] = useState([
    { id: 1, name: 'Gave Tzedakah', completed: true, date: 'Today' },
    { id: 2, name: 'Studied Torah', completed: true, date: 'Today' },
    { id: 3, name: 'Helped a neighbor', completed: false, date: 'Today' },
  ]);

  const toggleMitzvah = (id) => {
    setMitzvot(mitzvot.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-600" />
          Daily Mitzvot
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence>
          {mitzvot.map((mitzvah, idx) => (
            <motion.div
              key={mitzvah.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                mitzvah.completed ? 'bg-gradient-to-r from-amber-50 to-yellow-50' : 'bg-white'
              }`}
            >
              <button
                onClick={() => toggleMitzvah(mitzvah.id)}
                className="flex-shrink-0"
              >
                {mitzvah.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <div className="w-6 h-6 border-2 border-slate-300 rounded-full" />
                )}
              </button>
              <div className="flex-1">
                <div className={`font-medium ${mitzvah.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {mitzvah.name}
                </div>
                <div className="text-xs text-slate-600">{mitzvah.date}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button variant="outline" className="w-full rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Add Mitzvah
        </Button>

        <div className="pt-4 border-t border-slate-200 text-center">
          <div className="text-2xl font-black text-slate-900">
            {mitzvot.filter(m => m.completed).length}
          </div>
          <div className="text-sm text-slate-600">Completed today</div>
        </div>
      </CardContent>
    </Card>
  );
}