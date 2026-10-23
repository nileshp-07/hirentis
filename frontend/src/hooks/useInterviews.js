import { useState, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  useGetInterviewQuery,
  useCreateInterviewMutation,
  useUpdateInterviewMutation,
} from '@/redux/api/interviewApi';
import { useGetProfileQuery } from '@/redux/api/profileApi';
import { useGetResumesQuery } from '@/redux/api/resumeApi';

const STEPS = ['Basic Info', 'Resume Selection', 'Job Description'];

const experienceOption = (years) => {
  if (years == null) return '';
  if (years <= 1) return '0-1 years';
  if (years === 2) return '2 years';
  if (years <= 5) return '3-5 years';
  return '5+ years';
};

const hasProfileDefaults = (profile) =>
  Boolean(
    profile &&
    (profile.target_role ||
      profile.experience_years != null ||
      profile.tech_stack.length > 0)
  );

export const useInterviews = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: editingInterview, isLoading: isFetching } =
    useGetInterviewQuery(id, {
      skip: !id,
    });
  const { data: resumes = [] } = useGetResumesQuery();
  const { data: profile } = useGetProfileQuery(undefined, {
    skip: Boolean(id),
  });

  const [createInterview, { isLoading: isCreating }] =
    useCreateInterviewMutation();
  const [updateInterview, { isLoading: isUpdating }] =
    useUpdateInterviewMutation();

  const isEditing = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [techInput, setTechInput] = useState('');
  const [resumePreviewId, setResumePreviewId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    role: '',
    experience_level: '',
    interview_type: 'TECHNICAL',
    total_questions: '10',
    tech_stack: [],
    resume_id: '',
    job_description: '',
  });

  const [profileApplied, setProfileApplied] = useState(false);
  if (!isEditing && profile && !profileApplied) {
    setProfileApplied(true);
    setForm((prev) => ({
      ...prev,
      role: prev.role || profile.target_role || '',
      experience_level:
        prev.experience_level || experienceOption(profile.experience_years),
      tech_stack: prev.tech_stack.length ? prev.tech_stack : profile.tech_stack,
    }));
  }

  const [loadedInterviewId, setLoadedInterviewId] = useState(null);
  if (editingInterview && editingInterview.id !== loadedInterviewId) {
    setLoadedInterviewId(editingInterview.id);
    setForm({
      title: editingInterview.title || '',
      role: editingInterview.role || '',
      experience_level: editingInterview.experience_level || '',
      interview_type: editingInterview.interview_type || 'TECHNICAL',
      total_questions: String(editingInterview.total_questions || 10),
      tech_stack: editingInterview.tech_stack || [],
      resume_id: editingInterview.resume_id || '',
      job_description: editingInterview.job_description || '',
    });
  }

  const defaultResumeId =
    (resumes.find((r) => r.is_active) || resumes[0])?.id || '';
  const resolvedForm = useMemo(
    () => (form.resume_id ? form : { ...form, resume_id: defaultResumeId }),
    [form, defaultResumeId]
  );

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === resolvedForm.resume_id) || resumes[0],
    [resumes, resolvedForm.resume_id]
  );

  const handleAddTech = useCallback(() => {
    const value = techInput.trim();
    if (
      !value ||
      form.tech_stack.some((t) => t.toLowerCase() === value.toLowerCase())
    )
      return;
    setForm((prev) => ({ ...prev, tech_stack: [...prev.tech_stack, value] }));
    setTechInput('');
  }, [techInput, form.tech_stack]);

  const handleRemoveTech = useCallback((item) => {
    setForm((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((tech) => tech !== item),
    }));
  }, []);

  const canContinue =
    currentStep !== 1 ||
    Boolean(resolvedForm.title.trim() && resolvedForm.role.trim());

  const handleNext = () => {
    if (!canContinue) return;
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      const payload = {
        ...resolvedForm,
        title: resolvedForm.title.trim(),
        role: resolvedForm.role.trim(),
        experience_level: resolvedForm.experience_level || null,
        job_description: resolvedForm.job_description.trim() || null,
        resume_id: resolvedForm.resume_id || null,
        total_questions: parseInt(resolvedForm.total_questions, 10) || 5,
      };

      if (isEditing) {
        await updateInterview({ id, ...payload }).unwrap();
      } else {
        await createInterview(payload).unwrap();
      }
      router.push(`/dashboard/interviews`);
    } catch (err) {
      console.error('Failed to save interview:', err);
      toast.error('Failed to save interview', {
        description:
          err?.data?.detail || 'Something went wrong. Please try again.',
      });
    }
  };

  return {
    currentStep,
    steps: STEPS,
    form: resolvedForm,
    setForm,
    techInput,
    setTechInput,
    resumePreviewId,
    setResumePreviewId,
    selectedResume,
    isEditing,
    isFetching,
    isSubmitting: isCreating || isUpdating,
    isPrefilledFromProfile: !isEditing && hasProfileDefaults(profile),
    canContinue,
    handleAddTech,
    handleRemoveTech,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
