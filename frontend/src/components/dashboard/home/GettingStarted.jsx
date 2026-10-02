'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const STEPS = [
  {
    title: 'Upload your resume',
    description:
      'Questions are tailored to the projects and skills on your resume.',
    icon: FileText,
    action: { label: 'Upload resume', href: '/dashboard/resume' },
  },
  {
    title: 'Create an interview',
    description: 'Pick the role, tech stack and number of questions.',
    icon: Sparkles,
    action: { label: 'Create interview', href: '/dashboard/interviews/create' },
  },
  {
    title: 'Get your report',
    description:
      'Every answer is scored, with feedback, a transcript and what to practice next.',
    icon: BarChart3,
  },
];

const GettingStarted = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.15 }}
  >
    <Card className="p-6 md:p-8">
      <h2 className="text-lg font-semibold">Get started in three steps</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Your scores, trends and strongest topics will appear here after your
        first interview.
      </p>
      <ol className="mt-6 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-col rounded-xl border border-border bg-secondary/20 p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <step.icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">{step.title}</h3>
            <p className="mt-1 flex-1 text-sm text-muted-foreground">
              {step.description}
            </p>
            {step.action && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-4 w-fit gap-1.5 border-border"
              >
                <Link href={step.action.href}>
                  {step.action.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </li>
        ))}
      </ol>
    </Card>
  </motion.div>
);

export default GettingStarted;
