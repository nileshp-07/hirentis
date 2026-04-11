import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Code,
  Briefcase,
  FolderOpen,
  Eye,
  GraduationCap,
  History,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TruncatedText } from '@/components/ui/TruncatedText';

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed rounded-xl bg-secondary/10">
    <AlertCircle className="h-5 w-5 text-muted-foreground/40 mb-2" />
    <p className="text-xs text-muted-foreground italic">{message}</p>
  </div>
);

export default function ResumeParsedDetails({ activeResume }) {
  if (!activeResume?.parsedData) return null;

  const {
    skills = [],
    summary = "",
    experience_years = 0,
    projects = [],
    work_experience = [],
    education = []
  } = activeResume.parsedData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Resume Intelligence</h2>
          <p className="text-sm text-muted-foreground">Detailed extraction for {activeResume.name}</p>
        </div>
        <Badge variant="outline" className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-wider text-[10px]">
          Verified by AI
        </Badge>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">

        <div className="lg:col-span-8 space-y-6">

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 shadow-sm border-primary/5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Code className="h-4 w-4" />
                Technical Skills
              </div>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="hover:scale-105 transition-transform cursor-default bg-secondary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <EmptyState message="No specific skills identified." />
              )}
            </Card>

            <Card className="p-6 space-y-4 shadow-sm border-primary/5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Briefcase className="h-4 w-4" />
                Summary
              </div>
              {summary ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {summary}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="h-10 w-1 bg-primary rounded-full" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Tenure</p>
                      <p className="text-lg font-black">{experience_years}+ Years</p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState message="No professional summary available." />
              )}
            </Card>
          </div>

          <Card className="p-6 shadow-sm border-primary/5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
              <History className="h-4 w-4" />
              Work History
            </div>
            {work_experience?.length > 0 ? (
              <div className="space-y-8">
                {work_experience.map((exp, i) => (
                  <div key={i} className="relative pl-8 border-l border-border pb-2 group">
                    <div className="absolute -left-[5px] top-0 h-2.5 w-2.5 rounded-full bg-border group-hover:bg-primary transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-bold leading-none mb-1">{exp.role}</h3>
                        <p className="text-sm text-primary font-semibold">{exp.company}</p>
                      </div>
                      <Badge variant="outline" className="w-fit text-[10px] font-bold py-0.5">
                        {exp.duration}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No previous work history identified." />
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-sm border-primary/5 h-fit">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                <GraduationCap className="h-4 w-4" />
                Education
              </div>
              {education?.length > 0 ? (
                <div className="space-y-4">
                  {education.map((edu, i) => (
                    <div key={i} className="space-y-1 p-3 rounded-lg bg-secondary/30">
                      <h3 className="text-sm font-bold">{edu.degree}</h3>
                      <p className="text-xs text-primary font-medium">{edu.institution}</p>
                      <p className="text-[10px] text-muted-foreground italic">{edu.duration}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No academic background identified." />
              )}
            </Card>

            <Card className="p-6 shadow-sm border-primary/5">
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-4">
                <FolderOpen className="h-4 w-4" />
                Key Projects
              </div>
              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.map((project, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/50 hover:border-primary/20 transition-colors">
                      <p className="text-sm font-bold mb-1">{project.title}</p>
                      <TruncatedText text={project.description} limit={120} />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.tech_stack?.slice(0, 3).map(tech => (
                          <span key={tech} className="text-[9px] bg-primary/5 text-primary border border-primary/10 px-1.5 py-0.5 rounded uppercase font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No technical projects identified." />
              )}
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 h-fit sticky top-6">
          <Card className="overflow-hidden border-2 border-primary/5 shadow-xl bg-card/50 backdrop-blur-sm h-[700px] flex flex-col">
            <div className="p-4 border-b bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest">Live Preview</span>
              </div>
              <Badge variant="secondary" className="text-[9px] uppercase">PDF Document</Badge>
            </div>

            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-24 w-24 rounded-3xl bg-secondary flex items-center justify-center shadow-inner">
                  <Eye className="h-10 w-10 text-muted-foreground" />
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-foreground mb-1">Document Visualization</p>
                <p className="text-[11px] text-muted-foreground px-4">
                  {activeResume.name}
                </p>
              </div>

              <div className="w-full space-y-6 px-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className="h-1.5 rounded-full bg-secondary/80 animate-pulse"
                      style={{ width: `${70 + (i * 7) % 30}%` }}
                    />
                    {i % 4 === 0 && <div className="h-4" />}
                  </div>
                ))}
              </div>

              <div className="pt-8">
                <Badge variant="outline" className="text-[10px] text-muted-foreground animate-bounce">
                  Scrolling Enabled
                </Badge>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </motion.div>
  );
}
