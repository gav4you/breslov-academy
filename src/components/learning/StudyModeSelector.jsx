import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Headphones, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudyModeSelector({ onSelect }) {
  const [selectedMode, setSelectedMode] = useState('read');

  const modes = [
    { id: 'read', name: 'Reading', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { id: 'listen', name: 'Audio', icon: Headphones, color: 'from-purple-500 to-purple-600' },
    { id: 'group', name: 'Group', icon: Users, color: 'from-green-500 to-green-600' },
    { id: 'quick', name: 'Quick Review', icon: Zap, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {modes.map((mode, idx) => {
        const Icon = mode.icon;
        return (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedMode(mode.id);
              onSelect?.(mode.id);
            }}
            className={`p-6 rounded-2xl transition-all ${
              selectedMode === mode.id
                ? `bg-gradient-to-br ${mode.color} text-white shadow-xl scale-105`
                : 'bg-white text-slate-700 shadow-md'
            }`}
          >
            <Icon className={`w-8 h-8 mx-auto mb-2 ${selectedMode === mode.id ? '' : 'text-slate-600'}`} />
            <div className="font-bold text-sm">{mode.name}</div>
          </motion.button>
        );
      })}
    </div>
  );
}