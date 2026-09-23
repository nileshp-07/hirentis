'use client';

import { useUser } from '@clerk/nextjs';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user?.firstName || 'Candidate'}!`}
      />

      <Card className="p-6">
        <p className="text-muted-foreground">
          Dashboard functionality coming soon...
        </p>
      </Card>
    </div>
  );
}
