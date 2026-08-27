import React from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ToastProps {
  message: string;
  show: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="toast"
          className="toast"
          initial={{ opacity: 0, y: 16, x: '-50%', scale: 0.92 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: 12, x: '-50%', scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 28, mass: 0.6 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
