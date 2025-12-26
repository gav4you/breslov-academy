import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveViewerCount({ count = 0 }) {
  const [viewers, setViewers] = useState(count);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg"
    >
      <Radio className="w-4 h-4 animate-pulse" />
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4" />
        <span className="font-bold">{viewers}</span>
        <span className="text-sm">watching</span>
      </div>
    </motion.div>
  );
}