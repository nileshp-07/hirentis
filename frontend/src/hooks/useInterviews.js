import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGetInterviewQuery, useCreateInterviewMutation, useUpdateInterviewMutation } from '@/redux/api/interviewApi';
import { useGetResumesQuery } from '@/redux/api/resumeApi';

const STEPS = ['Basic Info', 'Resume Selection', 'Job Description'];
const DEFAULT_JD =
  'Build polished frontend experiences, collaborate with product and design, and communicate implementation tradeoffs clearly across teams.';

export const useInterviews = () => {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const { data: editingInterview, isLoading: isFetching } = useGetInterviewQuery(id, {
    skip: !id,
  });
  const { data: resumes = [] } = useGetResumesQuery();

  const [createInterview, { isLoading: isCreating }] = useCreateInterviewMutation();
  const [updateInterview, { isLoading: isUpdating }] = useUpdateInterviewMutation();

  const isEditing = Boolean(id);

  const [currentStep, setCurrentStep] = useState(1);
  const [techInput, setTechInput] = useState('');
  const [resumePreviewId, setResumePreviewId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    role: 'Frontend Engineer',
    experience_level: '2 years',
    interview_type: 'TECHNICAL',
    total_questions: '10',
    tech_stack: ['React', 'Next.js', 'Tailwind'],
    resume_id: '',
    job_description: DEFAULT_JD,
  });

  useEffect(() => {
    if (editingInterview) {
      setForm({
        title: editingInterview.title || '',
        role: editingInterview.role || '',
        experience_level: editingInterview.experience_level || '2 years',
        interview_type: editingInterview.interview_type || 'TECHNICAL',
        total_questions: String(editingInterview.total_questions || 10),
        tech_stack: editingInterview.tech_stack || [],
        resume_id: editingInterview.resume_id || '',
        job_description: editingInterview.job_description || '',
      });
    }
  }, [editingInterview]);

  useEffect(() => {
    if (!form.resume_id && resumes.length > 0) {
      const activeResume = resumes.find(r => r.is_active) || resumes[0];
      setForm(prev => ({ ...prev, resume_id: activeResume.id }));
    }
  }, [resumes, form.resume_id]);

  const selectedResume = useMemo(
    () => resumes.find((r) => r.id === form.resume_id) || resumes[0],
    [resumes, form.resume_id]
  );

  const handleAddTech = useCallback(() => {
    const value = techInput.trim();
    if (!value || form.tech_stack.some(t => t.toLowerCase() === value.toLowerCase())) return;
    setForm((prev) => ({ ...prev, tech_stack: [...prev.tech_stack, value] }));
    setTechInput('');
  }, [techInput, form.tech_stack]);

  const handleRemoveTech = useCallback((item) => {
    setForm((prev) => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((tech) => tech !== item),
    }));
  }, []);

  const handleNext = () =>
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        total_questions: parseInt(form.total_questions),
      };

      if (isEditing) {
        await updateInterview({ id, ...payload }).unwrap();
      } else {
        await createInterview(payload).unwrap();
      }
      router.push(`/dashboard/interviews`);
    } catch (err) {
      console.error('Failed to save interview:', err);
    }
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
    isFetching,
    isSubmitting: isCreating || isUpdating,
    handleAddTech,
    handleRemoveTech,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
