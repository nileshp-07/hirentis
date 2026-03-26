import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';

export default async function DashboardPage() {
  const user = await currentUser();

  // Route protection directly in the server component!
  if (!user) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${user.firstName || 'Candidate'}!`}
      />

      <Card className="p-6">
        <p className="text-muted-foreground">
          Dashboard functionality coming soon...
        </p>
      </Card>
    </div>
  );
}
