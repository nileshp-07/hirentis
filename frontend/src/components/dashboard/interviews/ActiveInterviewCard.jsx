import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock3, PencilLine, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/Modal';
import { PendingLoader } from './PendingLoader';
import { useDeleteInterviewMutation } from '@/redux/api/interviewApi';

const statusStyles = {
  scheduled: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  pending: 'bg-secondary text-secondary-foreground border-border',
};

const statusLabel = {
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  pending: 'Pending',
};

const actionLabel = {
  scheduled: 'Start Interview',
  in_progress: 'Continue Interview',
  pending: 'Preparing interview...',
};

export const ActiveInterviewCard = ({ interview, index }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteInterview, { isLoading: isDeleting }] = useDeleteInterviewMutation();

  const handleDelete = async () => {
    try {
      await deleteInterview(interview.id).unwrap();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to delete interview:', err);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.08, duration: 0.45 }}
      >
        <Card
          className="p-5 transition-all hover:y-[-4px] glow-card cursor-default"
          gradientBorder
        >
          <div className="flex flex-col lg:flex-row justify-between gap-6 my-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold">{interview.title}</h2>
                  <Badge className={statusStyles[interview.status]}>
                    {statusLabel[interview.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {interview.type} · {interview.totalQuestions} Questions
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {interview.techStack.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="border border-border bg-secondary/70"
                  >
                    {item}
                  </Badge>
                ))}
              </div>

              <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {interview.date}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {interview.duration}
                </span>
              </div>
            </div>
            <div className="w-full space-y-3 lg:w-[270px] lg:shrink-0">
              {interview.status === 'pending' ? (
                <PendingLoader />
              ) : (
                <Button
                  asChild
                  className="w-full gradient-bg text-primary-foreground hover:opacity-90"
                >
                  <Link href={`/dashboard/interviews/${interview.id}`}>
                    {actionLabel[interview.status]}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              )}
              
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 border-border bg-background/60 hover:bg-secondary/70"
                >
                  <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                    <PencilLine className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="border-border bg-background/60 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Interview?"
        description={`Are you sure you want to delete "${interview.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </>
  );
};
