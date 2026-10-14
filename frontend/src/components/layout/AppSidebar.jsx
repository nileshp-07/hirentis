'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Video,
  FileText,
  UserRound,
  ChevronLeft,
  Zap,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Video, label: 'Interviews', path: '/dashboard/interviews' },
  { icon: FileText, label: 'Resume', path: '/dashboard/resume' },
  { icon: UserRound, label: 'Profile', path: '/dashboard/profile' },
];

const AppSidebar = ({ collapsed, onToggle }) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <div className="gradient-bg rounded-lg p-1.5 shrink-0">
          <Zap className="h-4 w-4 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-lg overflow-hidden whitespace-nowrap"
            >
              Hirentis
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-auto py-4 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft
          className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </aside>
  );
};

export default AppSidebar;
