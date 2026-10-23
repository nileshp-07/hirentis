import Link from 'next/link';
import { Plus, UserRound, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const BasicInfo = ({
  form,
  setForm,
  techInput,
  setTechInput,
  handleAddTech,
  handleRemoveTech,
  isPrefilledFromProfile,
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {isPrefilledFromProfile && (
        <p className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground md:col-span-2">
          <UserRound className="h-4 w-4 shrink-0 text-primary" />
          <span>
            Role, experience and tech stack are filled in from your{' '}
            <Link
              href="/dashboard/profile"
              className="font-medium text-primary hover:underline"
            >
              profile
            </Link>
            . Change them for this interview if you need to.
          </span>
        </p>
      )}

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="title">Interview title</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Senior Full Stack Interview"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Target role</Label>
        <Input
          id="role"
          value={form.role}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, role: e.target.value }))
          }
          placeholder="Frontend Engineer"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience_level">Experience level</Label>
        <Select
          value={form.experience_level}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, experience_level: value }))
          }
        >
          <SelectTrigger className="bg-secondary/20 border-input">
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0-1 years">0-1 years</SelectItem>
            <SelectItem value="2 years">2 years</SelectItem>
            <SelectItem value="3-5 years">3-5 years</SelectItem>
            <SelectItem value="5+ years">5+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="interview_type">Interview type</Label>
        <Select
          value={form.interview_type}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, interview_type: value }))
          }
        >
          <SelectTrigger className="bg-secondary/20 border-input">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
            <SelectItem value="SYSTEM_DESIGN">System Design</SelectItem>
            <SelectItem value="HR">HR Round</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="total_questions">Total questions</Label>
        <Input
          id="total_questions"
          type="number"
          min={1}
          max={25}
          value={form.total_questions}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, total_questions: e.target.value }))
          }
        />
      </div>

      <div className="space-y-3 md:col-span-2">
        <Label htmlFor="tech-stack">Tech Stack / Skills</Label>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-secondary/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              id="tech-stack"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
              placeholder="Add React, Node, etc..."
              className="bg-background"
            />
            <Button
              type="button"
              onClick={handleAddTech}
              className="gradient-bg text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tech_stack.map((item) => (
              <Badge
                key={item}
                className="gap-1 border border-border bg-background/80 text-foreground py-1 px-2"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveTech(item)}
                  className="rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
