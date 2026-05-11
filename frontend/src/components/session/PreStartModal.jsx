"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, XCircle, Loader2, Mic, Wifi, Monitor, Volume2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const initialChecks = [
  { id: "browser", label: "Browser Compatibility", icon: Monitor, status: "pending" },
  { id: "mic", label: "Microphone Permission", icon: Mic, status: "pending" },
  { id: "audio", label: "Speaker / Audio Output", icon: Volume2, status: "pending" },
  { id: "internet", label: "Internet Connection", icon: Wifi, status: "pending" },
  { id: "focus", label: "Tab Focus Ready", icon: Eye, status: "pending" },
];

const instructions = [
  "Your interview will be taken by an AI interviewer — wait for its introduction before starting.",
  "After each question, click \"Speak\" to begin answering and submit when you are finished.",
  "Give detailed answers for better scoring and feedback.",
  "Answer all questions to receive your final analytics report.",
  "Use headphones or earphones for the best experience.",
];

const PreStartModal = ({ onStart, onClose }) => {
  const [checks, setChecks] = useState(initialChecks);
  const [allPassed, setAllPassed] = useState(false);

  useEffect(() => {
    const runChecks = async () => {
      for (let i = 0; i < initialChecks.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setChecks((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, status: "checking" } : c))
        );
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
        setChecks((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, status: "success" } : c))
        );
      }
      setAllPassed(true);
    };
    runChecks();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative w-full max-w-5xl rounded-2xl border border-border/60 bg-card/90 backdrop-blur-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="h-1 w-full gradient-bg" />

        <button onClick={onClose} className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-8 md:p-10 border-r border-border/40">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-foreground mb-2">Interview Practice Instructions</h2>
              <p className="text-sm text-muted-foreground mb-8">Prepare for your AI-powered interview session</p>
            </motion.div>

            <motion.div
              className="mb-8 rounded-xl border border-border/50 bg-secondary/40 p-5 gradient-border"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center">
                    <span className="text-xl font-bold text-primary-foreground">AI</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-card" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Hirentis AI Interviewer</p>
                  <p className="text-xs text-muted-foreground">Adaptive • Context-Aware • Real-time</p>
                </div>
              </div>
            </motion.div>

            <div className="space-y-4">
              {instructions.map((text, i) => (
                <motion.div
                  key={i}
                  className="flex gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.08 }}
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <p className="text-sm text-secondary-foreground leading-relaxed pt-0.5">{text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 className="text-2xl font-bold text-foreground mb-1">Compatibility Test</h2>
              <p className="text-sm text-muted-foreground mb-8">Setup Checklist</p>
            </motion.div>

            <div className="space-y-3 flex-1">
              {checks.map((check, i) => (
                <motion.div
                  key={check.id}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-secondary/30 px-5 py-4 transition-all"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <check.icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{check.label}</span>
                  {check.status === "pending" && (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  {check.status === "checking" && (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  )}
                  {check.status === "success" && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                  {check.status === "error" && (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                      <button className="text-xs text-primary hover:underline">Need Help?</button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: allPassed ? 1 : 0.5, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={onStart}
                disabled={!allPassed}
                className="w-full h-13 text-base font-semibold rounded-xl gradient-bg text-primary-foreground hover:opacity-90 transition-all relative overflow-hidden group disabled:opacity-40"
                size="lg"
              >
                {allPassed && (
                  <motion.div
                    className="absolute inset-0 gradient-bg opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ boxShadow: ["0 0 20px hsl(var(--primary) / 0.3)", "0 0 40px hsl(var(--primary) / 0.5)", "0 0 20px hsl(var(--primary) / 0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10">
                  {allPassed ? "Start Interview" : "Running checks..."}
                </span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PreStartModal;
