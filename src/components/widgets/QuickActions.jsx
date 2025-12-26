import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Video, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickActions() {
  const actions = [
    { icon: BookOpen, label: 'Start Course', color: 'from-blue-500 to-blue-600' },
    { icon: Video, label: 'Watch Shiur', color: 'from-purple-500 to-purple-600' },
    { icon: Users, label: 'Join Group', color: 'from-green-500 to-green-600' },
    { icon: Calendar, label: 'Schedule', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="lg"
            className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-2xl"
          >
            <Plus className="w-8 h-8" />
          </Button>
        </motion.div>

        <div className="absolute bottom-20 right-0 space-y-2 opacity-0 hover:opacity-100 transition-opacity">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Button
                  className={`w-14 h-14 rounded-full bg-gradient-to-r ${action.color} shadow-xl`}
                  title={action.label}
                >
                  <Icon className="w-6 h-6" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}