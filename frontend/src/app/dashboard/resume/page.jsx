'use client';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  useUploadResumeMutation,
  useGetResumesQuery,
  useDeleteResumeMutation,
  useActivateResumeMutation
} from '@/redux/api/resumeApi';
import { useAuth } from '@clerk/nextjs';
import ResumeHeader from '@/components/dashboard/resume/ResumeHeader';
import ResumeUploadArea from '@/components/dashboard/resume/ResumeUploadArea';
import ResumeList from '@/components/dashboard/resume/ResumeList';
import ResumeParsedDetails from '@/components/dashboard/resume/ResumeParsedDetails';
import dayjs from 'dayjs';
import { Loader } from '@/components/ui/Loader';
import { Modal } from '@/components/ui/Modal';

export default function ResumePage() {
  const { isLoaded, userId } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [previewResume, setPreviewResume] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const { data: rawResumes = [], isLoading: fetching } = useGetResumesQuery(undefined, {
    skip: !isLoaded || !userId,
  });
  const [uploadResume, { isLoading: uploading, isSuccess: uploadSuccess }] = useUploadResumeMutation();
  const [deleteResume] = useDeleteResumeMutation();
  const [activateResume] = useActivateResumeMutation();

  const resumes = rawResumes.map(r => ({
    id: r.id,
    name: r.title,
    uploadDate: dayjs(r.created_at).format('DD/MM/YYYY'),
    active: r.is_active,
    parsedData: r.parsed_data
  }));

  const activeResume = resumes.find((r) => r.active);

  const handleSetActive = async (id) => {
    try {
      await activateResume(id).unwrap();
      toast.success('Active resume updated');
    } catch (err) {
      toast.error('Failed to update active resume');
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteResume(deleteModal.id).unwrap();
      toast.success('Resume deleted');
    } catch (err) {
      toast.error('Failed to delete resume');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const handleDeleteTrigger = (id) => {
    setDeleteModal({ open: true, id });
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
          await uploadResume(file).unwrap();
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

  if (fetching && rawResumes.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader text="Loading your resumes..." />
      </div>
    );
  }

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
        handleDelete={handleDeleteTrigger}
        previewResume={previewResume}
        setPreviewResume={setPreviewResume}
      />

      <ResumeParsedDetails activeResume={activeResume} />

      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={confirmDelete}
        variant="danger"
        title="Delete Resume?"
        description="This action is permanent and cannot be undone. You will lose all parsed data for this document."
        confirmText="Yes, Delete"
      />
    </div>
  );
}
