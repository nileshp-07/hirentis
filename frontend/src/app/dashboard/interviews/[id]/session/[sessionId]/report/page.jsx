'use client';
import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageSquare,
  PhoneOff,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScoreCards from '@/components/dashboard/report/ScoreCards';
import QuestionBreakdown from '@/components/dashboard/report/QuestionBreakdown';
import TranscriptPanel from '@/components/dashboard/report/TranscriptPanel';
import {
  AiSummaryCard,
  InsightCards,
} from '@/components/dashboard/report/InsightSections';
import {
  ScoreTrendChart,
  SkillRadarChart,
  TopicScoresChart,
} from '@/components/dashboard/report/ReportCharts';
import { formatDuration } from '@/components/dashboard/report/chartTheme';
import { reportData } from '@/components/dashboard/report/reportData';

export default function InterviewReportPage({ params }) {
  const { id: interviewId } = use(params);
  const { interview, scores, skillRadar, topicScores, questions } = reportData;
  const isCompleted = interview.status === 'COMPLETED';

  const trendData = questions.map((question, index) => ({
    label: question.isFollowup ? `Q${question.number}f` : `Q${question.number}`,
    score: question.score,
    key: index,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg"
            aria-label="Back to interview"
          >
            <Link href={`/dashboard/interviews/${interviewId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{interview.title}</h1>
            <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span>{interview.role}</span>
              <span>·</span>
              <span>{interview.date}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3 w-3" />
                {formatDuration(interview.durationSeconds)}
              </span>
            </p>
          </div>
        </div>

        <Badge
          className={
            isCompleted
              ? 'self-start border border-emerald-500/30 bg-emerald-500/15 text-emerald-500'
              : 'self-start border border-border bg-secondary text-muted-foreground'
          }
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
            </>
          ) : (
            <>
              <PhoneOff className="mr-1 h-3 w-3" /> Ended early
            </>
          )}
        </Badge>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transcript">
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            Conversation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <ScoreCards scores={scores} />

          <div className="grid gap-4 lg:grid-cols-2">
            <SkillRadarChart data={skillRadar} />
            <ScoreTrendChart data={trendData} />
          </div>

          <TopicScoresChart data={topicScores} />

          <QuestionBreakdown questions={questions} />

          <InsightCards
            strengths={reportData.strengths}
            weaknesses={reportData.weaknesses}
            suggestions={reportData.suggestions}
          />

          <AiSummaryCard summary={reportData.aiSummary} />
        </TabsContent>

        <TabsContent value="transcript">
          <TranscriptPanel transcript={reportData.transcript} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
