'use client';
import { motion } from 'framer-motion';
import { Briefcase, Wrench } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import TagInput from './TagInput';

export const BIO_MAX_LENGTH = 1000;

const FieldError = ({ id, message }) =>
  message ? (
    <p id={id} className="text-xs text-destructive">
      {message}
    </p>
  ) : null;

const ProfileDetailsForm = ({ form, errors, setField }) => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Professional details
          </CardTitle>
        </CardHeader>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={form.fullName}
              onChange={(event) => setField('fullName', event.target.value)}
              maxLength={255}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'full-name-error' : undefined}
            />
            <FieldError id="full-name-error" message={errors.fullName} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-role">Target role</Label>
            <Input
              id="target-role"
              value={form.targetRole}
              onChange={(event) => setField('targetRole', event.target.value)}
              maxLength={255}
              placeholder="e.g. Backend Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience (years)</Label>
            <Input
              id="experience"
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={form.experienceYears ?? ''}
              onChange={(event) =>
                setField(
                  'experienceYears',
                  event.target.value === '' ? null : Number(event.target.value)
                )
              }
              placeholder="e.g. 2"
              aria-invalid={Boolean(errors.experienceYears)}
              aria-describedby={
                errors.experienceYears ? 'experience-error' : undefined
              }
            />
            <FieldError
              id="experience-error"
              message={errors.experienceYears}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="bio">Professional summary</Label>
              <span
                className={cn(
                  'font-mono text-xs text-muted-foreground',
                  form.bio.length > BIO_MAX_LENGTH && 'text-destructive'
                )}
              >
                {form.bio.length} / {BIO_MAX_LENGTH}
              </span>
            </div>
            <Textarea
              id="bio"
              rows={4}
              value={form.bio}
              onChange={(event) => setField('bio', event.target.value)}
              placeholder="A few sentences about what you work on and what you're aiming for."
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={errors.bio ? 'bio-error' : undefined}
            />
            <FieldError id="bio-error" message={errors.bio} />
          </div>
        </div>
      </Card>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" />
            Skills & technologies
          </CardTitle>
        </CardHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="tech-stack">Tech stack</Label>
            <p className="text-xs text-muted-foreground">
              Languages, frameworks, databases and tools you work with.
            </p>
            <TagInput
              id="tech-stack"
              values={form.techStack}
              onChange={(values) => setField('techStack', values)}
              placeholder="Add React, Node.js, PostgreSQL…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <p className="text-xs text-muted-foreground">
              Areas you&apos;re strong in, like system design or testing.
            </p>
            <TagInput
              id="skills"
              values={form.skills}
              onChange={(values) => setField('skills', values)}
              placeholder="Add API design, debugging…"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  </div>
);

export default ProfileDetailsForm;
