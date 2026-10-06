'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/Loader';
import ActiveAttemptBanner from '@/components/dashboard/home/ActiveAttemptBanner';
import GettingStarted from '@/components/dashboard/home/GettingStarted';
import QuickActions from '@/components/dashboard/home/QuickActions';
import RecentAttempts from '@/components/dashboard/home/RecentAttempts';
import StatTiles from '@/components/dashboard/home/StatTiles';
import TopicHighlights from '@/components/dashboard/home/TopicHighlights';
import WelcomeBanner from '@/components/dashboard/home/WelcomeBanner';
import {
  ScoreTrendChart,
  SkillRadarChart,
} from '@/components/dashboard/report/ReportCharts';
import ReportStatusCard from '@/components/dashboard/report/ReportStatusCard';
import { useDashboard } from '@/hooks/useDashboard';

export default function DashboardPage() {
  const { dashboard, isLoading, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-150 items-center justify-center">
        <Loader text="Loading your dashboard..." />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <ReportStatusCard
        icon={AlertTriangle}
        title="Couldn't load your dashboard"
        description="Something went wrong while loading it. Please try again."
        action={
          <Button onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        }
      />
    );
  }

  const {
    focus,
    activeAttempt,
    stats,
    skillAverages,
    scoreTrend,
    topics,
    recentAttempts,
  } = dashboard;
  const hasHistory = stats.attempts > 0;

  const trendData = scoreTrend.map((point) => {
    const date = new Date(point.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    return {
      label: date,
      score: point.score,
      tooltipLabel: `${point.interviewTitle} · ${date}`,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <WelcomeBanner focus={focus} />

      {activeAttempt && <ActiveAttemptBanner attempt={activeAttempt} />}

      {hasHistory ? (
        <>
          <StatTiles stats={stats} />

          <RecentAttempts attempts={recentAttempts} />

          {trendData.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <SkillRadarChart
                data={skillAverages}
                description="Your average across every report."
              />
              <ScoreTrendChart
                data={trendData}
                title="Score over time"
                description="Overall score of each finished interview."
              />
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
              Your skill profile and score trend will appear here once your
              first report is ready.
            </p>
          )}

          <TopicHighlights topics={topics} />

          <QuickActions />
        </>
      ) : (
        <GettingStarted />
      )}
    </motion.div>
  );
}
