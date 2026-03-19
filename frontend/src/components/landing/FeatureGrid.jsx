'use client';
import { motion } from 'framer-motion';
import {
  Bot,
  FileText,
  MessageCircle,
  Gauge,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

const FeatureGrid = () => {
  const anim = (i) => ({
    initial: { opacity: 0, y: 30, scale: 0.97 },
    whileInView: { opacity: 1, y: 0, scale: 1 },
    viewport: { once: true, margin: '-50px' },
    transition: { delay: i * 0.08, duration: 0.5 },
    whileHover: { y: -6, transition: { duration: 0.2 } },
  });

  return (
    <section id="features" className="relative py-24">
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to{' '}
            <span className="gradient-text">ace your interview</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Powerful features designed to maximize your interview preparation.
          </p>
        </motion.div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <motion.div {...anim(0)} className="sm:row-span-2 flex">
            <Card gradientBorder>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-xl font-bold">
                AI Interview Simulation
              </h3>
              <p className="text-sm text-muted-foreground flex-1">
                Lifelike AI interviewer asks industry-specific questions
                tailored to your target role and company culture.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
                <ul className="space-y-2.5 text-sm">
                  {[
                    'System Design Question',
                    'Behavioral Round',
                    'Technical Deep-dive',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </motion.div>

          <motion.div {...anim(1)} className="flex">
            <Card gradientBorder>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-bold">Resume-Aware Questions</h3>
              <p className="text-xs text-muted-foreground">
                Upload your resume and our AI crafts personalized questions from
                your experience.
              </p>
            </Card>
          </motion.div>

          <motion.div {...anim(2)} className="flex">
            <Card gradientBorder>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                <Gauge className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-bold">Real-time Evaluation</h3>
              <p className="text-xs text-muted-foreground">
                Instant scoring on clarity, depth, and relevance as you answer.
              </p>
            </Card>
          </motion.div>

          <motion.div {...anim(3)} className="sm:col-span-2 flex">
            <Card gradientBorder className="p-6 w-full h-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-full">
                <div className="flex-1">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                    <MessageCircle className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="mb-2 font-bold">
                    Dynamic Follow-up Questions
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    The AI adapts mid-conversation and probes deeper on your
                    answers — exactly like a senior interviewer would.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-border bg-secondary/50 p-3 space-y-2 text-xs w-full sm:w-56 mt-auto sm:mt-0">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      AI
                    </span>
                    <span className="text-muted-foreground">
                      How did you handle that failure?
                    </span>
                  </div>
                  <div className="flex items-start gap-2 justify-end text-right">
                    <span className="text-muted-foreground">
                      I broke it down into…
                    </span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      You
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      AI
                    </span>
                    <span className="text-muted-foreground">
                      What specifically went wrong?
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div {...anim(4)} className="flex">
            <Card gradientBorder className="p-6 w-full h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                <ClipboardCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-bold">Detailed Reports</h3>
              <p className="text-xs text-muted-foreground">
                Post-session breakdown with strengths, gaps, model answers, and
                improvement tips.
              </p>
            </Card>
          </motion.div>

          <motion.div {...anim(5)} className="flex">
            <Card gradientBorder className="p-6 w-full h-full">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg shadow-lg shadow-primary/20">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 font-bold">Performance Analytics</h3>
              <p className="text-xs text-muted-foreground">
                Track progress across key dimensions over time.
              </p>
            </Card>
          </motion.div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
