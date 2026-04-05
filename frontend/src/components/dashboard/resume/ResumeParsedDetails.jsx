import { motion } from "framer-motion";
import { Code, Briefcase, FolderOpen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ResumeParsedDetails({ activeResume }) {
  if (!activeResume?.parsedData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-4"
    >
      <h2 className="text-lg font-semibold">Parsed Resume Data</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Code className="h-4 w-4 text-primary" />
              Skills
            </div>
            <div className="flex flex-wrap gap-2">
              {activeResume.parsedData.skills.map((skill) => (
                <motion.div key={skill} whileHover={{ scale: 1.05 }}>
                  <Badge
                    variant="secondary"
                    className="hover:bg-primary/15 hover:text-primary transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-primary" />
              Experience
            </div>
            <p className="text-2xl font-bold">{activeResume.parsedData.experience}</p>
            <div className="flex flex-wrap gap-2">
              {activeResume.parsedData.experienceAreas.map((area) => (
                <Badge key={area} variant="outline" className="text-xs text-muted-foreground">
                  {area}
                </Badge>
              ))}
            </div>
          </Card>
          <Card className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderOpen className="h-4 w-4 text-primary" />
              Projects
            </div>
            <div className="space-y-3">
              {activeResume.parsedData.projects.map((project, i) => (
                <motion.div
                  key={project.title}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="rounded-lg border border-border bg-secondary/40 p-3 transition-colors hover:border-primary/30"
                >
                  <p className="text-sm font-medium">{project.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{project.desc}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">Resume Preview</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
            PDF preview for {activeResume.name}
          </p>
          <div className="w-full max-w-[220px] space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-secondary"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </motion.div >
  );
}
