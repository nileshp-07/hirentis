import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Check, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export default function ResumeUploadArea({
  isDragging,
  setIsDragging,
  handleDrop,
  handleFileSelect,
  uploading,
  uploadSuccess,
  uploadProgress,
}) {
  const inputRef = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-muted-foreground/30'
        }`}
      >
        <AnimatePresence mode="wait">
          {uploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-foreground">
                Uploading resume…
              </p>
              <div className="max-w-xs mx-auto">
                <Progress value={uploadProgress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(uploadProgress)}%
              </p>
            </motion.div>
          ) : uploadSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mx-auto h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center"
              >
                <Check className="h-6 w-6 text-primary" />
              </motion.div>
              <p className="text-sm font-medium text-primary">
                Resume uploaded successfully
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <motion.div
                animate={isDragging ? { scale: 1.15 } : { scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mx-auto h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center"
              >
                <Upload className="h-7 w-7 text-primary" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag and drop your resume here
                </p>
                <p className="text-xs text-muted-foreground mt-1">or</p>
              </div>
              <Button
                onClick={() => inputRef.current?.click()}
                className="gradient-bg text-primary-foreground hover:opacity-90"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <input
                type="file"
                ref={inputRef}
                accept="application/pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-xs text-muted-foreground">
                Supported format: PDF
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
