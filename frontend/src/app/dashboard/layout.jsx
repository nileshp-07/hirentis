'use client';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import AppSidebar from '@/components/layout/AppSidebar';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import { Loader } from '@/components/ui/Loader';

export default function DashboardLayout({ children }) {
  const { isLoaded } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader text="Loading your workspace..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      <div
        className={`transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-60'}`}
      >
        <DashboardNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
