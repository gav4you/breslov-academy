import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GripVertical, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DragDropMatching() {
  const [items] = useState([
    { id: 1, hebrew: 'שלום', english: 'Peace' },
    { id: 2, hebrew: 'אהבה', english: 'Love' },
    { id: 3, hebrew: 'חכמה', english: 'Wisdom' },
  ]);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GripVertical className="w-5 h-5 text-teal-600" />
          Match the Words
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm mb-3">Hebrew</h4>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg cursor-move"
                dir="rtl"
              >
                <div className="text-2xl font-bold text-center">{item.hebrew}</div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm mb-3">English</h4>
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-xl"
              >
                <div className="text-lg font-bold text-center text-slate-900">{item.english}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}