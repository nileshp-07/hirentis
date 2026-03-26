"use client";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { initialResumes } from "@/lib/mock-data";
import ResumeHeader from "@/components/dashboard/resume/ResumeHeader";
import ResumeUploadArea from "@/components/dashboard/resume/ResumeUploadArea";
import ResumeList from "@/components/dashboard/resume/ResumeList";
import ResumeParsedDetails from "@/components/dashboard/resume/ResumeParsedDetails";

export default function ResumePage() {
  const [resumes, setResumes] = useState(initialResumes);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);

  const activeResume = resumes.find((r) => r.active);

  const handleSetActive = (id) => {
    setResumes((prev) =>
      prev.map((r) => ({ ...r, active: r.id === id }))
    );
    const resume = resumes.find(r => r.id === id);
    if (resume) {
      toast.success("Active resume updated", {
        description: `${resume.name} is now your active resume.`,
      });
    }
  };

  const handleDelete = (id) => {
    const resume = resumes.find(r => r.id === id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (resume) {
      toast.info("Resume deleted", {
        description: `${resume.name} has been removed.`,
      });
    }
  };

  const simulateUpload = useCallback((file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          setUploadSuccess(true);
          setResumes((prev) => [
            {
              id: Date.now().toString(),
              name: file.name,
              uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              active: prev.length === 0,
              parsedData: null,
            },
            ...prev,
          ]);
          toast.success("Upload complete", {
            description: `${file.name} has been added to your profile.`,
          });
          setTimeout(() => setUploadSuccess(false), 3000);
        }, 500);
      } else {
        setUploadProgress(progress);
      }
    }, 300);
  }, []);

  const processFile = useCallback((file) => {
    if (!file) return;

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      simulateUpload(file);
    } else {
      toast.error("Invalid file format", {
        description: "Please upload a valid PDF file.",
      });
    }
  }, [simulateUpload]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      processFile(file);
    },
    [processFile]
  );

  return (
    <div className="space-y-8">
      <ResumeHeader activeResume={activeResume} />

      <ResumeUploadArea
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        handleDrop={handleDrop}
        handleFileSelect={handleFileSelect}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        uploadProgress={uploadProgress}
      />

      <ResumeList
        resumes={resumes}
        handleSetActive={handleSetActive}
        handleDelete={handleDelete}
        previewResume={previewResume}
        setPreviewResume={setPreviewResume}
      />

      <ResumeParsedDetails activeResume={activeResume} />
    </div>
  );
}
