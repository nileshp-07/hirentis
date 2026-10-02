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

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col gap-1.5 pb-3', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-sm font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardContent };
