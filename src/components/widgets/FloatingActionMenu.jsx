import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: BookOpen, label: 'New Course', color: 'from-blue-500 to-blue-600' },
    { icon: Users, label: 'Study Group', color: 'from-green-500 to-green-600' },
    { icon: Calendar, label: 'Schedule', color: 'from-purple-500 to-purple-600' },
    { icon: MessageCircle, label: 'Ask Question', color: 'from-pink-500 to-pink-600' },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-20 right-0 space-y-3">
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20, y: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm font-bold text-slate-700 bg-white px-3 py-1 rounded-lg shadow-lg">
                    {action.label}
                  </span>
                  <Button
                    className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} shadow-2xl`}
                  >
                    <Icon className="w-6 h-6" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-2xl"
        >
          <Plus className="w-8 h-8" />
        </Button>
      </motion.div>
    </div>
  );
}