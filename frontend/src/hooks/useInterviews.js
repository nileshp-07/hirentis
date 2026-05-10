import { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getInterviewById,
  getResumeById,
  resumeOptions,
} from '@/app/dashboard/interviews/interviewsData';

const STEPS = ['Basic Info', 'Resume Selection', 'Job Description'];
const DEFAULT_JD =
  'Build polished frontend experiences, collaborate with product and design, and communicate implementation tradeoffs clearly across teams.';

export const useInterviews = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const editingInterview = id ? getInterviewById(id) : null;
  const isEditing = Boolean(editingInterview);

  const [currentStep, setCurrentStep] = useState(1);
  const [techInput, setTechInput] = useState('');
  const [resumePreviewId, setResumePreviewId] = useState(null);

  const [form, setForm] = useState({
    title: editingInterview?.title ?? '',
    role: editingInterview?.role ?? 'Frontend Engineer',
    experience: editingInterview?.experience ?? '2 years',
    type: editingInterview?.type ?? 'Technical',
    totalQuestions: String(editingInterview?.totalQuestions ?? 10),
    techStack: editingInterview?.techStack ?? ['React', 'Next.js', 'Tailwind'],
    selectedResumeId:
      editingInterview?.selectedResumeId ??
      resumeOptions.find((resume) => resume.active)?.id ??
      resumeOptions[0].id,
    jobDescription: editingInterview?.jobDescription ?? DEFAULT_JD,
  });

  const selectedResume = useMemo(
    () => getResumeById(form.selectedResumeId) ?? resumeOptions[0],
    [form.selectedResumeId]
  );

  const handleAddTech = useCallback(() => {
    const value = techInput.trim();
    if (!value || form.techStack.some(t => t.toLowerCase() === value.toLowerCase())) return;
    setForm((prev) => ({ ...prev, techStack: [...prev.techStack, value] }));
    setTechInput('');
  }, [techInput, form.techStack]);

  const handleRemoveTech = useCallback((item) => {
    setForm((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((tech) => tech !== item),
    }));
  }, []);

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    router.push(`/dashboard/interviews`);
  };

  return {
    currentStep,
    steps: STEPS,
    form,
    setForm,
    techInput,
    setTechInput,
    resumePreviewId,
    setResumePreviewId,
    selectedResume,
    isEditing,
    handleAddTech,
    handleRemoveTech,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
