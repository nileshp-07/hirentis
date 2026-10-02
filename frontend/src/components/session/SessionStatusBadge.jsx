import { CheckCircle2, CircleDot, PhoneOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STATUS_BADGES = {
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    className: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-500',
  },
  ABANDONED: {
    label: 'Ended early',
    icon: PhoneOff,
    className: 'border-border bg-secondary text-muted-foreground',
  },
  IN_PROGRESS: {
    label: 'In progress',
    icon: CircleDot,
    className: 'border-primary/30 bg-primary/10 text-primary',
  },
};

const SessionStatusBadge = ({ status, className }) => {
  const badge = STATUS_BADGES[status] ?? STATUS_BADGES.IN_PROGRESS;
  return (
    <Badge className={cn('border', badge.className, className)}>
      <badge.icon className="mr-1 h-3 w-3" />
      {badge.label}
    </Badge>
  );
};

export default SessionStatusBadge;
