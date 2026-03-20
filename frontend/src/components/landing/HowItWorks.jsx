'use client';
import { motion } from 'framer-motion';
import {
  Upload,
  PlusCircle,
  Video,
  FileCheck,
  FileUp,
  Settings,
  Mic,
  BarChart3,
} from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Resume',
    desc: 'Upload your resume and select your target role.',
    preview: {
      icon: FileUp,
      label: 'resume_final.pdf',
      detail: '2.4 MB • Uploaded',
    },
  },
  {
    icon: PlusCircle,
    title: 'Create Interview',
    desc: 'Choose interview type, difficulty, and topics.',
    preview: {
      icon: Settings,
      label: 'Frontend Engineer',
      detail: 'React • Medium • 30 min',
    },
  },
  {
    icon: Video,
    title: 'Attend AI Interview',
    desc: 'Have a realistic conversation with our AI interviewer.',
    preview: {
      icon: Mic,
      label: 'Live Session',
      detail: 'Recording • 12:34',
    },
  },
  {
    icon: FileCheck,
    title: 'Get Detailed Feedback',
    desc: 'Receive comprehensive reports with improvement tips.',
    preview: {
      icon: BarChart3,
      label: 'Score: 92%',
      detail: '5 strengths • 2 areas to improve',
    },
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            How it <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Four simple steps to interview mastery.
          </p>
        </motion.div>

        <div className="relative mx-auto max-w-5xl">
          <div className="absolute top-[2.3rem] left-[12%] right-[12%] hidden lg:block">
            <div className="h-px bg-border" />
            <motion.div
              className="absolute top-0 left-0 h-px gradient-bg"
              initial={{ width: '0%' }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className="relative z-10 mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-border bg-card shadow-lg"
                  >
                    <div className="gradient-border rounded-2xl" />
                    <step.icon className="h-7 w-7 text-primary" />
                    <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full gradient-bg text-[10px] font-bold text-primary-foreground shadow-md">
                      {i + 1}
                    </span>
                  </motion.div>
                </div>

                <h3 className="mb-1 text-lg font-bold">{step.title}</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {step.desc}
                </p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                  className="w-full rounded-xl border border-border bg-secondary/50 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <step.preview.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold">
                        {step.preview.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {step.preview.detail}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
