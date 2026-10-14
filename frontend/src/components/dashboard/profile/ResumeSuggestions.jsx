'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, LoaderCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const ResumeSuggestions = ({
  resume,
  isLoading,
  profile,
  onAddTech,
  onUseExperience,
  onUseSummary,
}) => {
  const parsed = resume?.parsed_data ?? {};
  const known = new Set(
    [...profile.techStack, ...profile.skills].map((item) => item.toLowerCase())
  );
  const newSkills = (parsed.skills ?? []).filter(
    (skill) => !known.has(skill.toLowerCase())
  );
  const resumeYears = parsed.experience_years;
  const suggestYears =
    resumeYears > 0 && resumeYears !== profile.experienceYears;
  const suggestSummary = Boolean(parsed.summary) && !profile.bio.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            From your resume
          </CardTitle>
          {resume && (
            <p className="truncate text-xs text-muted-foreground">
              {resume.title}
            </p>
          )}
        </CardHeader>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : !resume ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload a resume and its skills and experience show up here, ready
              to add to your profile.
            </p>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-1.5 border-border"
            >
              <Link href="/dashboard/resume">
                Upload resume
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Skills not in your profile yet
                </p>
                {newSkills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => newSkills.forEach(onAddTech)}
                    className="text-xs text-primary hover:underline"
                  >
                    Add all
                  </button>
                )}
              </div>
              {newSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {newSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => onAddTech(skill)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-primary/40 px-2.5 py-1 text-xs text-foreground transition-colors hover:border-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3 text-primary" />
                      {skill}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs italic text-muted-foreground">
                  Your profile already covers every skill on your resume.
                </p>
              )}
            </div>

            {suggestYears && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Your resume shows{' '}
                  <span className="font-medium text-foreground">
                    {resumeYears} {resumeYears === 1 ? 'year' : 'years'}
                  </span>{' '}
                  of experience.
                </p>
                <button
                  type="button"
                  onClick={() => onUseExperience(resumeYears)}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Use this
                </button>
              </div>
            )}

            {suggestSummary && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">
                  Your resume has a summary you can start from.
                </p>
                <button
                  type="button"
                  onClick={() => onUseSummary(parsed.summary)}
                  className="shrink-0 text-xs text-primary hover:underline"
                >
                  Use it
                </button>
              </div>
            )}

            <Link
              href="/dashboard/resume"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Manage resumes
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default ResumeSuggestions;
