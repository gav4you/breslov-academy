import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LiveSessionIndicator({ isLive = false }) {
  if (!isLive) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex"
    >
      <Badge className="bg-red-500 text-white flex items-center gap-2 px-3 py-1.5 shadow-lg">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Radio className="w-3 h-3" />
        </motion.div>
        <span className="font-bold text-sm">LIVE</span>
      </Badge>
    </motion.div>
  );
}