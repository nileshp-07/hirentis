import { motion } from 'framer-motion';
import { FileText, CheckCircle2, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

export const ResumeSelection = ({
  form,
  setForm,
  resumes,
  selectedResume,
  resumePreviewId,
  setResumePreviewId,
}) => {
  const previewResume = resumes.find(r => r.id === resumePreviewId);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Card className="p-6" gradientBorder>
        <h3 className="text-lg font-bold mb-4">Selected Context</h3>
        {selectedResume ? (
          <div className="rounded-2xl border border-primary/70 p-5 mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-lg">{selectedResume.name}</p>
                <p className="text-sm text-muted-foreground italic">
                  Providing active context for evaluation
                </p>
              </div>
              <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                Selected
              </Badge>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-2">
                  Technical Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.parsed_data?.skills?.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="border border-border bg-background/50"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1">
                  Summary
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {selectedResume.parsed_data?.summary || "No summary available."}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {selectedResume.parsed_data?.projects?.slice(0, 2).map((project) => (
                  <div
                    key={project.title}
                    className="rounded-xl border border-border bg-background/50 p-3"
                  >
                    <p className="text-xs font-bold text-primary mb-1">
                      {project.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground italic border rounded-2xl mb-6">
            No resume selected.
          </div>
        )}

        <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-8 text-center group hover:bg-secondary/30 transition-colors">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-muted-foreground">
            PDF Preview Panel Placeholder
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1">Switch Resume</h3>
        {resumes.map((resume) => (
          <motion.div
            key={resume.id}
            whileHover={{ scale: 1.02, x: 4 }}
            onClick={() =>
              setForm((prev) => ({ ...prev, resume_id: resume.id }))
            }
            className={cn(
              'rounded-2xl border p-4 transition-all cursor-pointer',
              form.resume_id === resume.id
                ? 'border-primary/40 shadow-lg shadow-primary/5'
                : 'border-border bg-card/50 hover:bg-card hover:border-primary/20'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div
                  className={cn(
                    'mt-1 flex h-8 w-8 items-center justify-center rounded-lg border',
                    form.resume_id === resume.id
                      ? 'bg-primary text-primary-foreground border-transparent'
                      : 'bg-background text-muted-foreground'
                  )}
                >
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{resume.name}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {resume.parsed_data?.skills?.slice(0, 3).join(' • ')}
                  </p>
                </div>
              </div>
              {form.resume_id === resume.id && (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant={
                  form.resume_id === resume.id ? 'secondary' : 'outline'
                }
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setResumePreviewId(resume.id);
                }}
              >
                <Eye className="h-3 w-3 mr-2" />
                Preview Resume
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={Boolean(resumePreviewId)}
        onClose={() => setResumePreviewId(null)}
        title={previewResume?.name ?? 'Resume Details'}
        showIcon={false}
        maxWidth="max-w-6xl"
        cancelText="Close"
      >
        {previewResume && (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in zoom-in-95">
            <div className="space-y-5">
              <section>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">
                  Parsed Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {previewResume.parsed_data?.skills?.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-2">
                  Summary
                </p>
                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                  {previewResume.parsed_data?.summary}
                </p>
              </section>
              <section className="space-y-3">
                {previewResume.parsed_data?.projects?.map((p) => (
                  <div
                    key={p.title}
                    className="p-4 rounded-xl border border-border bg-secondary/10"
                  >
                    <p className="font-bold text-sm text-primary">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {p.description}
                    </p>
                  </div>
                ))}
              </section>
            </div>
            <div className="rounded-2xl border border-dashed border-border bg-secondary/30 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
              <FileText className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <p className="text-xs text-muted-foreground">
                Visual PDF Context Preview
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
