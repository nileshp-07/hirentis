'use client';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { initialResumes } from '@/lib/mock-data';
import { useUploadResumeMutation } from '@/redux/api/resumeApi';
import ResumeHeader from '@/components/dashboard/resume/ResumeHeader';
import ResumeUploadArea from '@/components/dashboard/resume/ResumeUploadArea';
import ResumeList from '@/components/dashboard/resume/ResumeList';
import ResumeParsedDetails from '@/components/dashboard/resume/ResumeParsedDetails';
import dayjs from 'dayjs';

export default function ResumePage() {
  const [resumes, setResumes] = useState(initialResumes);
  const [isDragging, setIsDragging] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [uploadResume, { isLoading: uploading, isSuccess: uploadSuccess }] =
    useUploadResumeMutation();

  const activeResume = resumes.find((r) => r.active);

  const handleSetActive = (id) => {
    const resume = resumes.find((r) => r.id === id);
    if (resume) {
      setResumes((prev) => prev.map((r) => ({ ...r, active: r.id === id })));
      toast.success('Active resume updated', {
        description: `${resume.name} is now your active resume.`,
      });
    }
  };

  const handleDelete = (id) => {
    const resume = resumes.find((r) => r.id === id);
    if (resume) {
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.info('Resume deleted', {
        description: `${resume.name} has been removed.`,
      });
    }
  };

  const processFile = useCallback(
    async (file) => {
      if (!file) return;

      const validFiles = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const ext = file.name.split('.').pop().toLowerCase();

      if (validFiles.includes(file.type) || ['pdf', 'docx'].includes(ext)) {
        try {
          const result = await uploadResume(file).unwrap();

          setResumes((prev) => [
            {
              id: result.id,
              name: result.title,
              uploadDate: dayjs(result.created_at).format('DD/MM/YYYY'),
              active: true,
              parsedData: result.parsed_data,
            },
            ...prev.map((r) => ({ ...r, active: false })),
          ]);

          toast.success('Upload complete', {
            description: `${file.name} has been parsed successfully.`,
          });
        } catch (err) {
          toast.error('Upload failed', {
            description:
              err.data?.detail || 'Something went wrong during parsing.',
          });
        }
      } else {
        toast.error('Invalid file format', {
          description: 'Please upload a valid PDF or DOCX file.',
        });
      }
    },
    [uploadResume]
  );

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
