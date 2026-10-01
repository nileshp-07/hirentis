'use client';
import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Clock3,
  Info,
  MessageSquare,
  MessageSquareOff,
  PlayCircle,
  RefreshCw,
  RotateCcw,
  SearchX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/Loader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InterviewerOrb from '@/components/session/room/InterviewerOrb';
import ScoreCards from '@/components/dashboard/report/ScoreCards';
import QuestionBreakdown from '@/components/dashboard/report/QuestionBreakdown';
import ReportHeader from '@/components/dashboard/report/ReportHeader';
import ReportStatusCard from '@/components/dashboard/report/ReportStatusCard';
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
import { SESSION_STATUS } from '@/hooks/useInterviewSession';
import { REPORT_STATE, useInterviewReport } from '@/hooks/useInterviewReport';

const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const UnavailableReport = ({ state, sessionHref, interviewHref, onRetry }) => {
  const cards = {
    [REPORT_STATE.IN_PROGRESS]: {
      icon: PlayCircle,
      title: 'This interview is still in progress',
      description: 'Your report will be ready once you finish the interview.',
      action: (
        <Button asChild className="gap-2">
          <Link href={sessionHref}>
            <PlayCircle className="h-4 w-4" />
            Continue interview
          </Link>
        </Button>
      ),
    },
    [REPORT_STATE.NO_ANSWERS]: {
      icon: MessageSquareOff,
      title: 'Nothing to report on',
      description:
        'This interview ended before any question was answered, so there is nothing to score.',
      action: (
        <Button asChild className="gap-2">
          <Link href={interviewHref}>
            <RotateCcw className="h-4 w-4" />
            Start a new attempt
          </Link>
        </Button>
      ),
    },
    [REPORT_STATE.GENERATING]: {
      visual: <InterviewerOrb status="thinking" size={72} />,
      title: 'Preparing your report…',
      description:
        'We are scoring your answers and writing your feedback. This usually takes under a minute, and the page updates on its own.',
    },
    [REPORT_STATE.DELAYED]: {
      icon: Clock3,
      title: 'This is taking longer than usual',
      description:
        'Your report is still being prepared. Give it a minute, then check again.',
      action: (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Check again
        </Button>
      ),
    },
  };

  return <ReportStatusCard {...cards[state]} />;
};

export default function InterviewReportPage({ params }) {
  const { id: interviewId, sessionId } = use(params);
  const { report, state, isLoading, error, checkAgain } =
    useInterviewReport(sessionId);
  const interviewHref = `/dashboard/interviews/${interviewId}`;

  if (isLoading) {
    return (
      <div className="flex h-150 items-center justify-center">
        <Loader text="Loading your report…" />
      </div>
    );
  }

  if (!report) {
    const isMissing = error?.status === 404 || error?.status === 422;
    return isMissing ? (
      <ReportStatusCard
        icon={SearchX}
        title="Report not found"
        description="This interview session doesn't exist or you don't have access to it."
        action={
          <Button asChild className="gap-2">
            <Link href="/dashboard/interviews">
              <ArrowLeft className="h-4 w-4" />
              Back to interviews
            </Link>
          </Button>
        }
      />
    ) : (
      <ReportStatusCard
        icon={AlertTriangle}
        title="Couldn't load your report"
        description="Something went wrong while loading it. Please try again."
        action={
          <Button onClick={checkAgain} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        }
      />
    );
  }

  const { interview, scores, skillRadar, topicScores, questions } = report;
  const isEndedEarly = interview.status === SESSION_STATUS.ABANDONED;
  const partialNotes = [
    isEndedEarly &&
      `You ended this interview early, so this report covers the ${plural(questions.length, 'answer')} you gave.`,
    report.unscoredCount > 0 &&
      `${plural(report.unscoredCount, 'answer')} couldn't be scored and ${report.unscoredCount === 1 ? "isn't" : "aren't"} counted in the scores.`,
  ].filter(Boolean);

  const trendData = questions
    .filter((question) => question.score != null)
    .map((question) => ({
      label: question.isFollowup
        ? `Q${question.number}f`
        : `Q${question.number}`,
      score: question.score,
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      <ReportHeader interview={interview} backHref={interviewHref} />

      {state !== REPORT_STATE.READY ? (
        <UnavailableReport
          state={state}
          sessionHref={`${interviewHref}/session/${sessionId}`}
          interviewHref={interviewHref}
          onRetry={checkAgain}
        />
      ) : (
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
            {partialNotes.length > 0 && (
              <div className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary/30 p-3.5 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{partialNotes.join(' ')}</p>
              </div>
            )}

            <ScoreCards scores={scores} />

            <div className="grid gap-4 lg:grid-cols-2">
              <SkillRadarChart data={skillRadar} />
              <ScoreTrendChart data={trendData} />
            </div>

            <TopicScoresChart data={topicScores} />

            <QuestionBreakdown questions={questions} />

            <InsightCards
              strengths={report.strengths}
              weaknesses={report.weaknesses}
              suggestions={report.suggestions}
            />

            {report.aiSummary && <AiSummaryCard summary={report.aiSummary} />}
          </TabsContent>

          <TabsContent value="transcript">
            <TranscriptPanel transcript={report.transcript} />
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
