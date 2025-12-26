import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState({ 
  icon: Icon = BookOpen,
  title = 'No content yet',
  description = 'Get started by adding your first item',
  actionLabel = 'Add Item',
  onAction
}) {
  return (
    <Card className="glass-effect border-0 premium-shadow-lg rounded-[2rem]">
      <CardContent className="p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto">
            <Icon className="w-12 h-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600">{description}</p>
          </div>
          {onAction && (
            <Button
              onClick={onAction}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-2xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              {actionLabel}
            </Button>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}