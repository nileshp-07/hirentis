'use client';
import { motion } from 'framer-motion';
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
import { dashboardData } from '@/components/dashboard/home/dashboardData';

export default function DashboardPage() {
  const {
    focus,
    activeAttempt,
    stats,
    skillAverages,
    scoreTrend,
    topics,
    recentAttempts,
  } = dashboardData;
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

          <TopicHighlights topics={topics} />

          <QuickActions />
        </>
      ) : (
        <GettingStarted />
      )}
    </motion.div>
  );
}
