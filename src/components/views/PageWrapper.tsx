import React from 'react';
import { motion } from 'motion/react';

interface PageWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, id, className = '' }) => {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`space-y-6 pb-12 ${className}`}
    >
      {children}
    </motion.div>
  );
};
