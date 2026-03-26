'use client';
import { useState } from 'react';
import AppSidebar from '@/components/layout/AppSidebar';
import DashboardNavbar from '@/components/layout/DashboardNavbar';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
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
