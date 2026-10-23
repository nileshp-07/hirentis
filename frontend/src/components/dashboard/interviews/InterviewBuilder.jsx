'use client';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

import { useInterviews } from '@/hooks/useInterviews';
import { useGetResumesQuery } from '@/redux/api/resumeApi';
import { BasicInfo } from './builder/BasicInfo';
import { ResumeSelection } from './builder/ResumeSelection';
import { JobDescription } from './builder/JobDescription';

export default function InterviewBuilder() {
  const {
    currentStep,
    steps,
    form,
    setForm,
    techInput,
    setTechInput,
    resumePreviewId,
    setResumePreviewId,
    selectedResume,
    isEditing,
    isFetching,
    isSubmitting,
    isPrefilledFromProfile,
    canContinue,
    handleAddTech,
    handleRemoveTech,
    handleNext,
    handleBack,
    handleSubmit,
  } = useInterviews();

  const { data: resumes = [] } = useGetResumesQuery();

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfo
            form={form}
            setForm={setForm}
            techInput={techInput}
            setTechInput={setTechInput}
            handleAddTech={handleAddTech}
            handleRemoveTech={handleRemoveTech}
            isPrefilledFromProfile={isPrefilledFromProfile}
          />
        );
      case 2:
        return (
          <ResumeSelection
            form={form}
            setForm={setForm}
            resumes={resumes}
            selectedResume={selectedResume}
            resumePreviewId={resumePreviewId}
            setResumePreviewId={setResumePreviewId}
          />
        );
      case 3:
        return <JobDescription form={form} setForm={setForm} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <section className="space-y-6">
        <Link
          href="/dashboard/interviews"
          className="inline-flex items-center gap-2 text-sm  text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Interviews
        </Link>

        <PageHeader
          title={isEditing ? 'Update Configuration' : 'New Interview Builder'}
          subtitle="Shape your AI-driven simulation through our guided multi-step builder."
        />
      </section>

      <div className="grid gap-3 md:grid-cols-3 pb-5 border-b border-border">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const active = currentStep === stepNumber;
          const complete = currentStep > stepNumber;

          return (
            <div key={step} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                  active &&
                    'border-primary/30 bg-primary text-primary-foreground',
                  complete && 'border-primary/20 bg-primary/10 text-primary',
                  !active &&
                    !complete &&
                    'border-border bg-secondary/40 text-muted-foreground'
                )}
              >
                {stepNumber}
              </div>
              <div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    active ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {step}
                </p>
                <p className="text-xs text-muted-foreground font-medium italic">
                  {stepNumber === currentStep
                    ? 'Current step'
                    : complete
                      ? 'Complete'
                      : 'Upcoming'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="min-h-[400px]">{renderCurrentStep()}</div>

      <footer className="mt-8 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-3">
          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canContinue}
              title={
                canContinue
                  ? undefined
                  : 'Add an interview title and target role to continue'
              }
            >
              Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Generating Strategy...
                </>
              ) : (
                <>
                  Finish Configuration
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
