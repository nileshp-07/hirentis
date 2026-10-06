'use client';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CheckCircle,
  TrendingUp,
  Video,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import CountUp from '@/components/dashboard/CountUp';
import { cn } from '@/lib/utils';

const AverageChange = ({ recent, overall }) => {
  const change = Math.round((recent - overall) * 10) / 10;
  if (change === 0) return <span>Steady over your last 5</span>;
  const isUp = change > 0;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={cn(
          'inline-flex items-center font-medium',
          isUp ? 'text-emerald-500' : 'text-rose-500'
        )}
      >
        <Arrow className="h-3.5 w-3.5" />
        {isUp ? '+' : ''}
        {change.toFixed(1)}
      </span>
      last 5 vs overall
    </span>
  );
};

const StatTiles = ({ stats }) => {
  const tiles = [
    {
      label: 'Interviews taken',
      value: stats.attempts,
      icon: Video,
      gradient: 'from-gradient-purple to-gradient-pink',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      gradient: 'from-gradient-blue to-gradient-purple',
      footer: stats.endedEarly > 0 && `${stats.endedEarly} ended early`,
    },
    {
      label: 'Average score',
      value: stats.averageScore,
      decimals: 1,
      suffix: '/10',
      icon: TrendingUp,
      gradient: 'from-gradient-pink to-gradient-purple',
      footer: stats.recentAverage != null && (
        <AverageChange
          recent={stats.recentAverage}
          overall={stats.averageScore}
        />
      ),
    },
    {
      label: 'Best score',
      value: stats.bestScore,
      decimals: 1,
      suffix: '/10',
      icon: Award,
      gradient: 'from-gradient-purple to-gradient-blue',
      footer: stats.bestInterviewTitle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile, index) => (
        <motion.div
          key={tile.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.5 }}
          whileHover={{ y: -4 }}
        >
          <Card className="glow-card h-full p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {tile.label}
              </span>
              <div
                className={cn(
                  'rounded-lg bg-gradient-to-br p-2',
                  tile.gradient
                )}
              >
                <tile.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-3xl font-semibold">
              <CountUp value={tile.value} decimals={tile.decimals} />
              {tile.suffix && (
                <span className="text-base font-medium text-muted-foreground">
                  {tile.suffix}
                </span>
              )}
            </p>
            {tile.footer && (
              <p className="mt-1.5 truncate text-xs text-muted-foreground">
                {tile.footer}
              </p>
            )}
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default StatTiles;
