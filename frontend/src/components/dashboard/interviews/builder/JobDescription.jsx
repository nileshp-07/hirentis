import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const JobDescription = ({ form, setForm }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="space-y-2">
        <Label htmlFor="job-description">Job description</Label>
        <Textarea
          id="job-description"
          value={form.jobDescription}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, jobDescription: e.target.value }))
          }
          placeholder="Paste the job description or role requirements here..."
          className="min-h-[300px] bg-secondary/20"
        />
      </div>
      <div className="text-muted-foreground text-sm">
        Paste job description from LinkedIn or company website.
      </div>
    </div>
  );
};
