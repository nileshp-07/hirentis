"use client";
import { useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, MapPin, PencilLine, Sparkles, Target, UserRound, Wrench, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PreStartModal from "@/components/session/PreStartModal";
import WarmupScreen from "@/components/session/WarmupScreen";
import { useGetInterviewQuery } from "@/redux/api/interviewApi";

const metadataItems = (interview) => [
  { icon: CalendarDays, label: "Created At", value: new Date(interview.created_at).toLocaleDateString() },
  { icon: MapPin, label: "Location", value: "Remote" },
  { icon: Wrench, label: "Type", value: interview.interview_type },
  { icon: Clock3, label: "Duration", value: interview.interview_overview?.estimated_duration || "45 mins" },
  { icon: Target, label: "Difficulty", value: interview.experience_level ? (isNaN(interview.experience_level) ? interview.experience_level : `${interview.experience_level} Years`) : "Standard" },
  { icon: UserRound, label: "Experience", value: interview.experience_level ? (isNaN(interview.experience_level) ? interview.experience_level : `${interview.experience_level} Years`) : "Not Specified" },
];

export default function InterviewDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const { data: interview, isLoading, error } = useGetInterviewQuery(id);

  const [launchPhase, setLaunchPhase] = useState("idle");

  const sessionId = `session-${Date.now()}`;

  const handleStartClick = useCallback(() => setLaunchPhase("pre-start"), []);
  const handlePreStartComplete = useCallback(() => setLaunchPhase("warmup"), []);
  const handleWarmupComplete = useCallback(() => {
    router.push(`/dashboard/interviews/${id}/session/${sessionId}`);
  }, [router, id, sessionId]);
  const handleClose = useCallback(() => setLaunchPhase("idle"), []);

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!interview || error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-10 text-center">
          <h1 className="text-2xl font-bold">Interview not found</h1>
          <p className="mt-2 text-muted-foreground">The selected interview configuration could not be loaded.</p>
          <Button asChild className="mt-6 gradient-bg text-primary-foreground hover:opacity-90">
            <Link href="/dashboard/interviews">Back to Interviews</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const overview = interview.interview_overview || {};

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{interview.role}</h1>
              <Badge className="border-primary/20 bg-primary/10 text-primary">Open</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{interview.title}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" className="border-border bg-background/60 hover:bg-secondary/70">
              <Link href={`/dashboard/interviews/${interview.id}/edit`}>
                <PencilLine className="h-4 w-4 mr-2" />
                Edit Interview
              </Link>
            </Button>
            <Button onClick={handleStartClick} className="gradient-bg text-primary-foreground hover:opacity-90">
              Start Interview
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metadataItems(interview).map((item) => (
            <Card key={item.label}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 font-medium">{item.value}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="mb-6 flex flex-col space-y-1.5">
              <h3 className="flex items-center gap-2 text-xl font-semibold leading-none tracking-tight">
                <Sparkles className="h-5 w-5 text-primary" />
                {overview.overview_title || "Interview Overview"}
              </h3>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{interview.interview_type} Interview</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {interview.total_questions} Questions · {interview.tech_stack?.join(" + ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated Duration</p>
                    <p className="mt-1 text-lg font-semibold">{overview.estimated_duration || "45 mins"}</p>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="summary" className="rounded-2xl border border-border bg-secondary/20 px-4">
                <AccordionItem value="summary" className="border-none">
                  <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">AI Strategy Summary</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    {overview.summary || "Generating your personalized interview strategy..."}
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="job-description" className="border-none">
                  <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">Job Description</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">
                    {interview.job_description || "No job description provided."}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div>
                <h3 className="mb-3 font-semibold">Focus Areas</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {overview.focus_areas?.map((item) => (
                    <div key={item} className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
                      {item}
                    </div>
                  ))}
                  {(!overview.focus_areas || overview.focus_areas.length === 0) && (
                      <p className="text-sm text-muted-foreground italic">No focus areas identified yet.</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <div className="mb-6 flex flex-col space-y-1.5">
                <h3 className="text-xl font-semibold leading-none tracking-tight">Technical Stack</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {interview.tech_stack?.map((item) => (
                  <Badge key={item} className="border border-border bg-primary/10 text-primary">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-6 flex flex-col space-y-1.5">
                <h3 className="text-xl font-semibold leading-none tracking-tight">Preparation Tips</h3>
              </div>
              <ul className="space-y-3">
                {overview.preparation_tips?.map((tip, index) => (
                  <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="text-primary font-bold">•</span>
                    {tip}
                  </li>
                ))}
                {(!overview.preparation_tips || overview.preparation_tips.length === 0) && (
                    <p className="text-sm text-muted-foreground italic">Stay sharp and focused on core fundamentals.</p>
                )}
              </ul>
            </Card>
          </div>
        </section>
      </motion.div>

      <AnimatePresence>
        {launchPhase === "pre-start" && (
          <motion.div
            key="pre-start-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          >
            <PreStartModal onStart={handlePreStartComplete} onClose={handleClose} />
          </motion.div>
        )}
        {launchPhase === "warmup" && (
          <motion.div
            key="warmup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-background"
          >
            <WarmupScreen onComplete={handleWarmupComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
