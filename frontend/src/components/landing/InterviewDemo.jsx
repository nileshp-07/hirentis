'use client';
import { motion } from 'framer-motion';
import { Video } from 'lucide-react';
import { Card } from '../ui/card';

const messages = [
  {
    role: 'ai',
    text: "Hello! Let's begin your interview. Can you explain the concept of React Virtual DOM?",
  },
  {
    role: 'user',
    text: 'React uses a virtual DOM, which is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new virtual DOM tree and diffs it against the previous one.',
  },
  {
    role: 'ai',
    text: 'Great explanation! How does this diffing algorithm improve performance compared to direct DOM manipulation?',
  },
  {
    role: 'user',
    text: 'Instead of updating the entire DOM, React only applies the minimal set of changes needed. This batching and selective updating is much faster than manipulating the real DOM directly.',
  },
];

const InterviewDemo = () => {
  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Experience an <span className="gradient-text">AI Interview</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            See how our AI conducts realistic technical interviews.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-7"
        >
          <Card className="lg:col-span-3">
            <div className="aspect-square rounded-lg bg-secondary flex flex-col items-center justify-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-bg">
                <Video className="h-7 w-7 text-primary-foreground" />
              </div>
              <p className="font-semibold text-sm">AI Interviewer</p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-500">Live</span>
              </div>
              <div className="mt-4 flex gap-1 items-end">
                {[
                  { h: 22, d: 1.7 },
                  { h: 15, d: 2.1 },
                  { h: 28, d: 1.6 },
                  { h: 18, d: 2.3 },
                  { h: 26, d: 1.9 },
                  { h: 14, d: 2.4 },
                  { h: 24, d: 1.8 },
                ].map((val, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full gradient-bg"
                    style={{
                      height: `${val.h}px`,
                      animationName: 'pulse-glow',
                      animationDuration: `${val.d}s`,
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-4 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <span className="text-sm font-semibold">
                Interview Transcript
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                12:34
              </span>
            </div>
            <div className="flex-1 space-y-3">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : ''}`}
                >
                  {m.role === 'ai' && (
                    <div className="h-6 w-6 shrink-0 rounded-full gradient-bg flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.role === 'ai' ? 'bg-secondary' : 'bg-primary/20'
                    }`}
                  >
                    {m.text}
                  </div>
                </motion.div>
              ))}
              <div className="flex gap-2">
                <div className="h-6 w-6 shrink-0 rounded-full gradient-bg flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                  AI
                </div>
                <div className="rounded-lg bg-secondary px-3 py-2 flex gap-1">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: '0s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: '0.2s' }}
                  />
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: '0.4s' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default InterviewDemo;
