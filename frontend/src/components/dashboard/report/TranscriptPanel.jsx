'use client';
import { motion } from 'framer-motion';
import { Clock, Sparkles, User } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const TranscriptPanel = ({ transcript }) => (
  <Card className="p-0">
    <CardHeader className="border-b border-border p-5 pb-4">
      <CardTitle>Full transcript</CardTitle>
      <p className="text-xs text-muted-foreground">
        Everything said during the interview, in order.
      </p>
    </CardHeader>

    <ScrollArea className="h-[60vh]">
      <div className="space-y-4 p-4 sm:p-6">
        {transcript.map((message, index) => {
          const isInterviewer = message.role === 'ai';
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.4) }}
              className={cn('flex gap-3', !isInterviewer && 'flex-row-reverse')}
            >
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                  isInterviewer ? 'gradient-bg' : 'bg-secondary'
                )}
              >
                {isInterviewer ? (
                  <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>

              <div
                className={cn(
                  'max-w-[78%] rounded-2xl border px-4 py-3 text-sm leading-relaxed',
                  isInterviewer
                    ? 'rounded-tl-sm border-border bg-secondary/40'
                    : 'rounded-tr-sm border-border bg-card'
                )}
              >
                <p className="whitespace-pre-wrap text-secondary-foreground">
                  {message.text}
                </p>
                <span className="mt-1.5 flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {message.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  </Card>
);

export default TranscriptPanel;
