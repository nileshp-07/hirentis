import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const Loader = ({ size = 'md', className, text }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className={cn(
            'rounded-full border-t-primary border-r-transparent border-b-transparent border-l-transparent',
            sizes[size]
          )}
        />
        <div
          className={cn(
            'absolute inset-0 rounded-full border-muted/20',
            sizes[size]
          )}
        />
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-medium text-muted-foreground animate-pulse"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export { Loader };
