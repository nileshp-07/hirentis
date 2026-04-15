import { LoaderCircle } from 'lucide-react';

export const PendingLoader = () => (
  <div className="rounded-xl border border-border bg-secondary/60 p-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
      Preparing interview
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
      </span>
    </div>
  </div>
);
