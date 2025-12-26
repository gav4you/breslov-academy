import React from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChapterNavigation({ chapters, currentChapter, onSelect }) {
  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <div className="p-6 space-y-2">
        {chapters?.map((chapter, idx) => (
          <motion.button
            key={chapter.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => chapter.unlocked && onSelect?.(chapter)}
            disabled={!chapter.unlocked}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
              currentChapter === chapter.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                : chapter.unlocked
                ? 'bg-white hover:bg-slate-50 text-slate-900'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {chapter.completed ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : chapter.unlocked ? (
              <Circle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Lock className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="flex-1 text-left">
              <div className="font-bold text-sm">Chapter {idx + 1}</div>
              <div className={`text-xs ${currentChapter === chapter.id ? 'text-white/80' : 'text-slate-600'}`}>
                {chapter.title}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}