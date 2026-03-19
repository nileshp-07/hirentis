import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef(
  ({ className, gradientBorder, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 border border-border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {gradientBorder && (
        <div className="gradient-border absolute mb-3 inset-0 rounded-[inherit] pointer-events-none" />
      )}

      {children}
    </div>
  )
);
Card.displayName = 'Card';

export { Card };
