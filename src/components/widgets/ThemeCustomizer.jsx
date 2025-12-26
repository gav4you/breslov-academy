import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState('default');

  const themes = [
    { id: 'default', name: 'Classic', colors: ['#1e293b', '#3b82f6', '#f59e0b'] },
    { id: 'forest', name: 'Forest', colors: ['#064e3b', '#10b981', '#84cc16'] },
    { id: 'ocean', name: 'Ocean', colors: ['#0c4a6e', '#0ea5e9', '#06b6d4'] },
    { id: 'sunset', name: 'Sunset', colors: ['#7c2d12', '#f97316', '#fb923c'] },
    { id: 'royal', name: 'Royal', colors: ['#3730a3', '#8b5cf6', '#a78bfa'] },
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-pink-600" />
          Theme Customizer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme, idx) => (
            <motion.button
              key={theme.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTheme(theme.id)}
              className={`relative p-4 rounded-xl transition-all ${
                selectedTheme === theme.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'bg-white hover:bg-slate-50'
              }`}
            >
              {selectedTheme === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex gap-1 mb-2">
                {theme.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="text-sm font-bold text-slate-900">{theme.name}</div>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}