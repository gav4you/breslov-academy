import React from 'react';
import { motion } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StudyReminder({ onDismiss, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed bottom-6 right-6 z-40 max-w-sm"
    >
      <div className="glass-morphism rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900">Time to Study!</h3>
          </div>
          <button onClick={onDismiss} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-700 mb-4">
          You scheduled to study Talmud Berachot at this time
        </p>
        <div className="flex gap-2">
          <Button
            onClick={onStart}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl"
          >
            Start Now
          </Button>
          <Button onClick={onDismiss} variant="outline" className="rounded-xl">
            Later
          </Button>
        </div>
      </div>
    </motion.div>
  );
}