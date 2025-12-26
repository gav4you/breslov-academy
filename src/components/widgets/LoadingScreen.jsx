import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Loader2 } from 'lucide-react';

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl"
        >
          <BookOpen className="w-12 h-12 text-white" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-white">{message}</h2>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-slate-300"
          >
            Preparing your learning experience...
          </motion.div>
        </div>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="w-3 h-3 bg-amber-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}