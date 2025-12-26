import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpDown, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SortingGame() {
  const [items, setItems] = useState([
    { id: 1, text: 'Bereshit', order: 1 },
    { id: 2, text: 'Vayikra', order: 3 },
    { id: 3, text: 'Shemot', order: 2 },
    { id: 4, text: 'Bamidbar', order: 4 },
    { id: 5, text: 'Devarim', order: 5 },
  ].sort(() => Math.random() - 0.5));

  const isCorrect = items.every((item, idx) => item.order === idx + 1);

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-teal-600" />
          Sort the Five Books
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            whileDrag={{ scale: 1.05, zIndex: 10 }}
            className="p-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg cursor-move"
          >
            <div className="flex items-center justify-between">
              <span>{item.text}</span>
              <span className="text-xs opacity-70">#{idx + 1}</span>
            </div>
          </motion.div>
        ))}

        {isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-center text-white font-bold flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Perfect Order! +100 XP
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}