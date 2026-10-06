'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WelcomeBanner = ({ focus }) => {
  const { user } = useUser();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="gradient-border flex flex-col gap-4 rounded-2xl border border-transparent bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || 'there'}{' '}
          <motion.span
            aria-hidden="true"
            className="inline-block origin-[70%_70%]"
            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
            transition={{ duration: 1.6, delay: 0.4 }}
          >
            👋
          </motion.span>
        </h1>
        {focus ? (
          <p className="mt-1 text-muted-foreground">
            Preparing for{' '}
            <span className="font-medium text-primary">{focus.role}</span>{' '}
            interviews
            {focus.experienceLevel && (
              <span className="text-sm">
                {' '}
                · {focus.experienceLevel} experience
              </span>
            )}
          </p>
        ) : (
          <p className="mt-1 text-muted-foreground">
            Set up your first practice interview to start tracking your
            progress.
          </p>
        )}
      </div>
      <Button
        asChild
        className="gradient-bg shrink-0 gap-2 font-medium text-primary-foreground hover:opacity-90"
      >
        <Link href="/dashboard/interviews/create">
          <Zap className="h-4 w-4" />
          Start new interview
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </motion.section>
  );
};

export default WelcomeBanner;
