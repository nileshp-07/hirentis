'use client';
import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/ui/Loader';
import ProfileDetailsForm, {
  BIO_MAX_LENGTH,
} from '@/components/dashboard/profile/ProfileDetailsForm';
import ProfileHeader from '@/components/dashboard/profile/ProfileHeader';
import ResumeSuggestions from '@/components/dashboard/profile/ResumeSuggestions';
import ReportStatusCard from '@/components/dashboard/report/ReportStatusCard';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
} from '@/redux/api/profileApi';
import { useGetResumesQuery } from '@/redux/api/resumeApi';

const MAX_EXPERIENCE_YEARS = 50;
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const USES = [
  'Your target role and experience set the level of the questions.',
  'Your tech stack and skills decide which topics come up.',
  'Your summary lets the interviewer ask about your own work.',
];

const validate = (form) => {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Your name is required.';
  const years = form.experienceYears;
  if (
    years !== null &&
    (!Number.isInteger(years) || years < 0 || years > MAX_EXPERIENCE_YEARS)
  ) {
    errors.experienceYears = `Enter a whole number from 0 to ${MAX_EXPERIENCE_YEARS}.`;
  }
  if (form.bio.length > BIO_MAX_LENGTH) {
    errors.bio = `Keep it under ${BIO_MAX_LENGTH} characters.`;
  }
  return errors;
};

const completenessOf = (form) => {
  const checks = [
    form.fullName.trim(),
    form.targetRole.trim(),
    form.experienceYears !== null,
    form.bio.trim(),
    form.techStack.length > 0,
    form.skills.length > 0,
  ];
  return { filled: checks.filter(Boolean).length, total: checks.length };
};

const toForm = (profile) => ({
  fullName: profile.full_name,
  targetRole: profile.target_role ?? '',
  experienceYears: profile.experience_years,
  bio: profile.bio ?? '',
  techStack: profile.tech_stack,
  skills: profile.skills,
});

const toPayload = (form) => ({
  full_name: form.fullName,
  target_role: form.targetRole,
  experience_years: form.experienceYears,
  bio: form.bio,
  tech_stack: form.techStack,
  skills: form.skills,
});

function ProfileEditor({ profile }) {
  const { user } = useUser();
  const saved = useMemo(() => toForm(profile), [profile]);
  const [form, setForm] = useState(saved);
  const [updateProfile] = useUpdateProfileMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarDraft, setAvatarDraft] = useState(null);
  const { data: resumes = [], isLoading: resumesLoading } =
    useGetResumesQuery();
  const activeResume = resumes.find((resume) => resume.is_active) ?? null;

  const isDirty =
    JSON.stringify(form) !== JSON.stringify(saved) || avatarDraft !== null;
  const avatarUrl =
    avatarDraft?.previewUrl ?? (avatarDraft?.remove ? null : user?.imageUrl);
  const hasCustomPhoto = avatarDraft?.file
    ? true
    : !avatarDraft?.remove && Boolean(user?.hasImage);
  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  useEffect(() => {
    const url = avatarDraft?.previewUrl;
    return () => url && URL.revokeObjectURL(url);
  }, [avatarDraft]);

  const pickAvatar = (file) => {
    if (!AVATAR_TYPES.includes(file.type)) {
      toast.error('Use a JPG, PNG or WebP image');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('Choose an image under 5 MB');
      return;
    }
    setAvatarDraft({ file, previewUrl: URL.createObjectURL(file) });
  };

  const setField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const addTech = (item) =>
    setForm((current) =>
      current.techStack.some((v) => v.toLowerCase() === item.toLowerCase())
        ? current
        : { ...current, techStack: [...current.techStack, item] }
    );

  const handleSave = async () => {
    if (hasErrors) {
      toast.error('Fix the highlighted fields first');
      return;
    }
    setIsSaving(true);
    try {
      if (avatarDraft?.file)
        await user.setProfileImage({ file: avatarDraft.file });
      if (avatarDraft?.remove) await user.setProfileImage({ file: null });
    } catch {
      setIsSaving(false);
      toast.error("Couldn't update your photo", {
        description: 'Please try again.',
      });
      return;
    }
    setAvatarDraft(null);
    try {
      const updated = await updateProfile(toPayload(form)).unwrap();
      setForm(toForm(updated));
      toast.success('Profile saved');
    } catch (err) {
      toast.error("Couldn't save your profile", {
        description:
          typeof err?.data?.detail === 'string'
            ? err.data.detail
            : 'Please check your details and try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-28"
    >
      <PageHeader
        title="Profile"
        subtitle="These details shape the questions your AI interviewer asks."
      />

      <ProfileHeader
        fullName={form.fullName.trim()}
        email={user?.primaryEmailAddress?.emailAddress}
        avatarUrl={avatarUrl}
        canRemoveAvatar={hasCustomPhoto}
        onPickAvatar={pickAvatar}
        onRemoveAvatar={() => setAvatarDraft({ remove: true })}
        targetRole={form.targetRole.trim()}
        completeness={completenessOf(form)}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ProfileDetailsForm form={form} errors={errors} setField={setField} />

        <div className="space-y-6">
          <ResumeSuggestions
            resume={activeResume}
            isLoading={resumesLoading}
            profile={form}
            onAddTech={addTech}
            onUseExperience={(years) => setField('experienceYears', years)}
            onUseSummary={(summary) =>
              setField('bio', summary.slice(0, BIO_MAX_LENGTH))
            }
          />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How your profile is used
                </CardTitle>
              </CardHeader>
              <ul className="space-y-2.5">
                {USES.map((use) => (
                  <li
                    key={use}
                    className="flex gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    <span className="leading-relaxed">{use}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isDirty && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4"
          >
            <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-border bg-card/95 px-5 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <p className="text-sm text-muted-foreground">
                You have unsaved changes
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setForm(saved);
                  setAvatarDraft(null);
                }}
                disabled={isSaving}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || hasErrors}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save changes
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ProfilePage() {
  const {
    data: profile,
    isLoading,
    refetch,
  } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  if (isLoading) {
    return (
      <div className="flex h-150 items-center justify-center">
        <Loader text="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <ReportStatusCard
        icon={AlertTriangle}
        title="Couldn't load your profile"
        description="Something went wrong while loading it. Please try again."
        action={
          <Button onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        }
      />
    );
  }

  return <ProfileEditor profile={profile} />;
}
