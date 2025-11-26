'use client';

import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative cursor-pointer p-2 text-white hover:bg-secondary-blue-600 rounded-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        animate={count > 0 ? { rotate: [0, -10, 10, -5, 5, 0] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
      >
        <Bell className="h-5 w-5" />
      </motion.div>

      {count > 0 && (
        <motion.div
          className="absolute top-0 right-0.5 h-4 w-4 bg-gradient-to-r from-primary-green-600 to-primary-green-700 rounded-full flex items-center justify-center shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        >
          <motion.span
            className="text-xs font-bold text-gray-700"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
          >
            {count > 9 ? '9+' : count}
          </motion.span>
        </motion.div>
      )}
    </motion.button>
  );
}
