'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ACTIONS = [
  {
    label: 'Start a practice interview',
    description: 'Jump into an AI-powered mock interview.',
    icon: Sparkles,
    href: '/dashboard/interviews/create',
  },
  {
    label: 'Upload your resume',
    description: 'Get questions tailored to your experience.',
    icon: FileText,
    href: '/dashboard/resume',
  },
  {
    label: 'View your reports',
    description: 'Review scores and feedback from past interviews.',
    icon: BarChart3,
    href: '/dashboard/interviews',
  },
];

const QuickActions = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {ACTIONS.map((action, index) => (
      <motion.div
        key={action.label}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 + index * 0.08 }}
        whileHover={{ y: -4 }}
      >
        <Link href={action.href} className="block h-full">
          <Card className="glow-card h-full p-5 transition-colors hover:border-primary/30">
            <div className="gradient-bg mb-3 w-fit rounded-lg p-2.5">
              <action.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="mb-1 font-semibold">{action.label}</h3>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          </Card>
        </Link>
      </motion.div>
    ))}
  </div>
);

export default QuickActions;
