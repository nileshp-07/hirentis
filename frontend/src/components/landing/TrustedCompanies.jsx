'use client';
import { motion } from 'framer-motion';

const companies = [
  'Google',
  'Microsoft',
  'Meta',
  'Spotify',
  'Coinbase',
  'Amazon',
  'Apple',
  'Netflix',
  'Stripe',
  'Uber',
];

const TrustedCompanies = () => {
  return (
    <section className="border-y border-border/50 bg-secondary/30 py-12">
      <div className="container mx-auto px-4">
        <p className="mb-8 text-center text-sm text-muted-foreground">
          Trusted by candidates from top companies
        </p>
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />
          <motion.div
            className="flex gap-12 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          >
            {[...companies, ...companies].map((company, i) => (
              <div
                key={i}
                className="flex h-10 items-center text-lg font-semibold text-muted-foreground/50 transition-colors hover:text-muted-foreground"
              >
                {company}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustedCompanies;
