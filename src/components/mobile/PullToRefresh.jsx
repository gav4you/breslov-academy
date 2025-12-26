import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 150], [0, 1]);
  const rotate = useTransform(y, [0, 150], [0, 360]);

  const handleDragEnd = async (event, info) => {
    if (info.offset.y > 150 && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh?.();
      setIsRefreshing(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      <motion.div
        style={{ opacity }}
        className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10"
      >
        <motion.div style={{ rotate }}>
          <RefreshCw className={`w-6 h-6 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y }}
      >
        {children}
      </motion.div>
    </div>
  );
}