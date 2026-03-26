'use client';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';

const DashboardNavbar = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">
      <div className="flex items-center gap-2">
        <AnimatedThemeToggler className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors" />
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full gradient-bg" />
        </Button>
        <UserButton />
      </div>
    </header>
  );
};

export default DashboardNavbar;
