import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'from-green-500 to-green-600',
  error: 'from-red-500 to-red-600',
  info: 'from-blue-500 to-blue-600',
  warning: 'from-amber-500 to-amber-600',
};

export default function ToastNotification({ type = 'info', message, onClose, duration = 3000 }) {
  const Icon = icons[type];

  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 max-w-md bg-gradient-to-r ${colors[type]} rounded-2xl shadow-2xl p-4 text-white`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Icon className="w-6 h-6" />
        </div>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/20 rounded-lg p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}