'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Camera, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

const ProfileHeader = ({
  fullName,
  email,
  avatarUrl,
  canRemoveAvatar,
  onPickAvatar,
  onRemoveAvatar,
  targetRole,
  completeness,
}) => {
  const fileInputRef = useRef(null);
  const percent = Math.round((completeness.filled / completeness.total) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="gradient-border flex flex-col gap-6 border-transparent md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex shrink-0 flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile photo"
              className="group/avatar relative h-20 w-20 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- Clerk-hosted or local preview
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-full w-full rounded-full border border-border object-cover"
                />
              ) : (
                <div className="gradient-bg flex h-full w-full items-center justify-center rounded-full text-2xl font-bold text-primary-foreground">
                  {initials(fullName)}
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover/avatar:opacity-100 group-focus-visible/avatar:opacity-100">
                <Camera className="h-5 w-5 text-white" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onPickAvatar(file);
                event.target.value = '';
              }}
            />
            {canRemoveAvatar && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove photo
              </button>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">
              {fullName || 'Your profile'}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {email && (
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </span>
              )}
              {targetRole && (
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {targetRole}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="w-full space-y-2 md:w-64">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile completeness</span>
            <span className="font-semibold">{percent}%</span>
          </div>
          <Progress
            value={percent}
            aria-label={`Profile ${percent}% complete`}
            className="h-2 bg-secondary"
          />
          <p className="text-xs text-muted-foreground">
            {completeness.filled === completeness.total
              ? 'Everything the interviewer needs is filled in.'
              : `${completeness.total - completeness.filled} more ${
                  completeness.total - completeness.filled === 1
                    ? 'detail'
                    : 'details'
                } for more personal questions.`}
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProfileHeader;
