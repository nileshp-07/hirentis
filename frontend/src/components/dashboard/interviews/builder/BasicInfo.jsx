import { Plus, X } from 'lucide-react';
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
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
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
        <Label htmlFor="experience">Experience level</Label>
        <Select
          value={form.experience}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, experience: value }))
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
        <Label htmlFor="type">Interview type</Label>
        <Select
          value={form.type}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="bg-secondary/20 border-input">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Behavioral">Behavioral</SelectItem>
            <SelectItem value="System Design">System Design</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="questions">Total questions</Label>
        <Input
          id="questions"
          type="number"
          min={1}
          max={25}
          value={form.totalQuestions}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, totalQuestions: e.target.value }))
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
            {form.techStack.map((item) => (
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
