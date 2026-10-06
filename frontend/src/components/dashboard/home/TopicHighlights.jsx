'use client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const GROUPS = [
  {
    key: 'strong',
    title: 'Strong topics',
    description: 'Topics where you average 7.5 or more.',
    dot: 'bg-emerald-500',
    chip: 'border-emerald-500/30 bg-emerald-500/10',
  },
  {
    key: 'weak',
    title: 'Needs improvement',
    description: 'Topics averaging under 6. Practice these next.',
    dot: 'bg-amber-500',
    chip: 'border-amber-500/30 bg-amber-500/10',
  },
];

const TopicHighlights = ({ topics }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {GROUPS.map((group, index) => (
      <motion.div
        key={group.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + index * 0.05 }}
      >
        <Card className="h-full p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <span className={cn('h-2 w-2 rounded-full', group.dot)} />
            {group.title}
          </h2>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            {group.description}
          </p>
          {topics[group.key].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {topics[group.key].map(({ topic, score }) => (
                <span
                  key={topic}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm',
                    group.chip
                  )}
                >
                  {topic}
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {score.toFixed(1)}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">
              Nothing here yet. Topics show up once a few answers are scored.
            </p>
          )}
        </Card>
      </motion.div>
    ))}
  </div>
);

export default TopicHighlights;
