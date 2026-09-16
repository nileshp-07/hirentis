'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Loader } from '@/components/ui/Loader';

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

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
