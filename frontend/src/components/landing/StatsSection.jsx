'use client';
import { motion, useInView, animate } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: 10000, suffix: '+', label: 'Interviews Completed' },
  { value: 92, suffix: '%', label: 'Success Rate' },
  { value: 150, suffix: 'k+', label: 'Candidates Prepared' },
  { value: 45, suffix: '+', label: 'Companies Hiring' },
];
function CountUp({ target, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const controls = animate(0, target, {
      duration: 1.5,
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });

    return () => controls.stop();
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const StatsSection = () => {
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
            Trusted by <span className="gradient-text">thousands</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-6 text-center glow-card transition-all"
            >
              <p className="text-3xl font-bold gradient-text">
                <CountUp target={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
