"use client";
import { useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, MapPin, PencilLine, Sparkles, Target, UserRound, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PreStartModal from "@/components/session/PreStartModal";
import WarmupScreen from "@/components/session/WarmupScreen";
import { getInterviewById, getResumeById } from "../interviewsData";

const metadataItems = (interview) => [
  { icon: CalendarDays, label: "Interview Date", value: interview.date || "TBD" },
  { icon: MapPin, label: "Location", value: interview.location || "Remote" },
  { icon: Wrench, label: "Type", value: interview.type || "Technical" },
  { icon: Clock3, label: "Duration", value: interview.duration || "45 mins" },
  { icon: Target, label: "Difficulty", value: interview.difficulty || "Medium" },
  { icon: UserRound, label: "Experience", value: interview.experience || "2+ Years" },
];

export default function InterviewDetailPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();

  const interviewData = getInterviewById(id);

  const interview = interviewData ? {
    ...interviewData,
    role: interviewData.title || "Software Engineer",
    company: interviewData.company || "Hirentis",
    difficulty: interviewData.difficulty || "Medium",
    experience: interviewData.experience || "2+ Years",
    location: interviewData.location || "Remote",
    jobDescription: interviewData.jobDescription || "Build polished frontend experiences, collaborate with product and design, and communicate implementation tradeoffs clearly across teams.",
    requirements: interviewData.requirements || [
      "Strong technical communication",
      "Domain-specific fundamentals",
      "Problem-solving clarity",
    ],
    cultureFit: interviewData.cultureFit || ["Collaborative", "Analytical", "Detail Oriented"],
    selectedResumeId: interviewData.selectedResumeId || "res-001"
  } : null;

  const [launchPhase, setLaunchPhase] = useState("idle");

  const sessionId = `session-${Date.now()}`;

  const handleStartClick = useCallback(() => setLaunchPhase("pre-start"), []);
  const handlePreStartComplete = useCallback(() => setLaunchPhase("warmup"), []);
  const handleWarmupComplete = useCallback(() => {
    router.push(`/dashboard/interviews/${id}/session/${sessionId}`);
  }, [router, id, sessionId]);
  const handleClose = useCallback(() => setLaunchPhase("idle"), []);

  if (!interview) {
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

  const resume = getResumeById(interview.selectedResumeId);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold">{interview.role}</h1>
              <Badge className="border-primary/20 bg-primary/10 text-primary">Open</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{interview.company}</p>
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
                Interview Overview
              </h3>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{interview.type} Interview</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {interview.totalQuestions} Questions · {interview.techStack?.join(" + ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Estimated Duration</p>
                    <p className="mt-1 text-lg font-semibold">{interview.duration || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="job-description" className="rounded-2xl border border-border bg-secondary/20 px-4">
                <AccordionItem value="job-description" className="border-none">
                  <AccordionTrigger className="py-4 text-base font-medium hover:no-underline">Job Description</AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm text-muted-foreground">{interview.jobDescription}</AccordionContent>
                </AccordionItem>
              </Accordion>

              <div>
                <h3 className="mb-3 font-semibold">Requirements</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {interview.requirements?.map((item) => (
                    <div key={item} className="rounded-xl border border-border bg-secondary/30 p-4 text-sm">
                      {item}
                    </div>
                  ))}
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
                {interview.techStack?.map((item) => (
                  <Badge key={item} className="border border-border bg-primary/10 text-primary">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-6 flex flex-col space-y-1.5">
                <h3 className="text-xl font-semibold leading-none tracking-tight">Culture Fit</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {interview.cultureFit?.map((item) => (
                  <Badge key={item} variant="secondary" className="border border-border bg-secondary/60">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>

            {resume && (
              <Card>
                <div className="mb-6 flex flex-col space-y-1.5">
                  <h3 className="text-xl font-semibold leading-none tracking-tight">Resume Context</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">{resume.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{resume.experience}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="border border-border bg-secondary/60">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            )}
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
