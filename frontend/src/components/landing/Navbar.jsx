'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="gradient-bg rounded-lg p-1.5">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">Hirentis</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Show when="signed-out">
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
              <Button
                size="sm"
                className="gradient-bg border-0 text-primary-foreground hover:opacity-90"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="mr-2">
                Dashboard
              </Button>
            </Link>
            <UserButton />
          </Show>
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="container mx-auto flex flex-col gap-4 px-4 py-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-3 pt-2">
                <Show when="signed-out">
                  <div className="flex-1">
                    <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                      <Button variant="outline" className="w-full" size="sm">
                        Login
                      </Button>
                    </SignInButton>
                  </div>
                  <div className="flex-1">
                    <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                      <Button
                        size="sm"
                        className="w-full gradient-bg border-0 text-primary-foreground"
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </div>
                </Show>
                <Show when="signed-in">
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex items-center justify-center p-2">
                    <UserButton />
                  </div>
                </Show>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
