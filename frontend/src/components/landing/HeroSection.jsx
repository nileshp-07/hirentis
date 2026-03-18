'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Mic, MessageSquare, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Meteors } from '@/components/ui/meteors';
import { BorderBeam } from '@/components/ui/border-beam';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-10">
      <InteractiveGridPattern
        className="opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent)]"
        width={60}
        height={60}
        squares={[20, 20]}
        squaresClassName="hover:fill-primary/20"
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <Meteors number={10} />
      </div>
      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center gap-12 px-4 py-20 lg:flex-row lg:py-0 pointer-events-none">
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full gradient-bg animate-pulse-glow" />
            AI-Powered Interview Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
          >
            Practice Real <span className="gradient-text">Interviews</span>
            <br />
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-lg text-lg text-muted-foreground"
          >
            Prepare for technical interviews with AI-powered mock interviews,
            dynamic follow-up questions, and real-time feedback.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  size="lg"
                  className="gradient-bg border-0 text-primary-foreground hover:opacity-90 gap-2 shadow-lg shadow-primary/25"
                >
                  Start Free Interview <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative flex flex-1 items-center justify-center pointer-events-auto"
        >
          <div className="relative w-full max-w-md">
            <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl glow-purple">
              <BorderBeam
                size={250}
                duration={12}
                delay={9}
                colorFrom="#7b25f4"
                colorTo="#f43a9b"
              />
              <div className="mb-4 flex items-center gap-3 rounded-xl bg-secondary p-4 relative z-10">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-bg">
                  <Video className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Interviewer</p>
                  <p className="text-xs text-muted-foreground">Live Session</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500">Recording</span>
                </div>
              </div>

              <div className="mb-3 rounded-lg border border-border bg-secondary/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Current Question
                </p>
                <p className="text-sm font-medium">
                  Explain the concept of React Virtual DOM and how it improves
                  performance.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full gradient-bg flex items-center justify-center shrink-0">
                    <MessageSquare className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="rounded-lg bg-secondary/80 px-3 py-2 text-xs">
                    Can you walk me through your approach?
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="rounded-lg bg-primary/20 px-3 py-2 text-xs">
                    React uses a virtual DOM to batch updates...
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-border p-2">
                <Mic className="h-4 w-4 text-primary animate-pulse-glow" />
                <span className="text-xs text-muted-foreground">
                  Listening...
                </span>
                <div className="flex gap-0.5">
                  {[
                    { h: 14, d: 1.2 },
                    { h: 18, d: 1.6 },
                    { h: 10, d: 1.1 },
                    { h: 16, d: 1.8 },
                    { h: 12, d: 1.4 },
                  ].map((val, i) => (
                    <div
                      key={i}
                      className="w-0.5 rounded-full gradient-bg"
                      style={{
                        height: `${val.h}px`,
                        animationName: 'pulse-glow',
                        animationDuration: `${val.d}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-4 rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
            >
              <p className="text-xs font-semibold gradient-text">92% Score</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
