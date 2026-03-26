import { motion } from "framer-motion";
import { FileText, Star, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ResumeList({
  resumes,
  handleSetActive,
  handleDelete,
  previewResume,
  setPreviewResume
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-3"
    >
      <h2 className="text-lg font-semibold">Your Resumes</h2>
      <div className="grid gap-3">
        {resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-border bg-secondary/20"
          >
            <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No resumes found</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first resume to get started.</p>
          </motion.div>
        ) : (
          resumes.map((resume, i) => (
          <motion.div
            key={resume.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileHover={{ y: -2 }}
            className="group rounded-xl border border-border bg-card p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${resume.active ? "gradient-bg" : "bg-secondary"
                  }`}
              >
                <FileText
                  className={`h-5 w-5 ${resume.active ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{resume.name}</p>
                <p className="text-xs text-muted-foreground">Uploaded {resume.uploadDate}</p>
              </div>
              {resume.active && (
                <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] shrink-0">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {!resume.active && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => handleSetActive(resume.id)}
                  title="Set Active"
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setPreviewResume(previewResume === resume.id ? null : resume.id)}
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(resume.id)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
