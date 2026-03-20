'use client';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How does the AI interview work?',
    a: 'Our AI interviewer uses advanced language models to conduct realistic technical interviews. It asks questions based on your resume and target role, listens to your answers, and asks intelligent follow-up questions — just like a real interviewer.',
  },
  {
    q: 'Is my resume data private?',
    a: 'Absolutely. Your resume and interview data are encrypted and never shared with third parties. We use your resume solely to generate personalized interview questions during your sessions.',
  },
  {
    q: 'How are answers evaluated?',
    a: 'Each answer is evaluated across multiple dimensions including technical accuracy, communication clarity, problem-solving approach, and depth of knowledge. You receive a detailed breakdown after every session.',
  },
  {
    q: 'Can I practice interviews multiple times?',
    a: 'Yes! You can take unlimited practice interviews. Our AI generates fresh questions each time so you never repeat the same interview twice. Track your improvement over time with our analytics dashboard.',
  },
  {
    q: 'What types of interviews are supported?',
    a: 'We support technical coding interviews, system design interviews, behavioral interviews, and role-specific interviews for frontend, backend, full-stack, data science, and more.',
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-24">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--color-gradient-pink)/0.04),transparent_60%)]" />
      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about Hirentis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <AccordionItem
                  value={`faq-${i}`}
                  className="rounded-xl border border-border bg-card px-5 transition-colors duration-200 hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:shadow-[0_0_20px_-6px_var(--color-gradient-purple)/0.2]"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4 [&[data-state=open]>svg]:rotate-180">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
