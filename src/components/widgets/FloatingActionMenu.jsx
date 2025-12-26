import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, MessageCircle, Calendar, Users, X } from 'lucide-react';

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: BookOpen, label: 'New Lesson', color: 'bg-blue-600' },
    { icon: MessageCircle, label: 'Ask Question', color: 'bg-purple-600' },
    { icon: Calendar, label: 'Schedule', color: 'bg-green-600' },
    { icon: Users, label: 'Find Partner', color: 'bg-amber-600' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-3"
          >
            {actions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg font-semibold text-slate-900 whitespace-nowrap">
                    {action.label}
                  </div>
                  <Button
                    className={`${action.color} text-white rounded-full h-12 w-12 p-0 shadow-xl`}
                  >
                    <Icon className="w-6 h-6" />
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full h-16 w-16 p-0 shadow-2xl"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
      </Button>
    </div>
  );
}