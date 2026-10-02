'use client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const ReportStatusCard = ({
  icon: Icon,
  visual,
  title,
  description,
  action,
}) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="flex flex-col items-center px-6 py-14 text-center">
      {visual ?? (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <h2 className="mt-6 text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  </motion.div>
);

export default ReportStatusCard;
