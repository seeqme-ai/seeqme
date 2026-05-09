import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cloudinaryService } from '@/services/cloudinaryService';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoUploaded: (url: string) => void;
  personName?: string;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  onPhotoUploaded,
  personName = '',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = getInitials(personName);

  const resetState = () => {
    setPreview(null);
    setSelectedFile(null);
    setIsDragging(false);
    setIsUploading(false);
    setUploadProgress(0);
    setIsDone(false);
    setError(null);
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, etc.)');
      return;
    }
    setError(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    // Simulate progress while waiting for upload
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) { clearInterval(progressInterval); return prev; }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const result = await cloudinaryService.uploadFile(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsDone(true);

      setTimeout(() => {
        onPhotoUploaded(result.secureUrl || result.url);
        resetState();
      }, 900);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'var(--surface, #1a1a2e)' }}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Gradient header band */}
            <div
              className="h-28 w-full relative"
              style={{
                background: 'linear-gradient(135deg, var(--primary, #0d9488) 0%, color-mix(in srgb, var(--primary, #0d9488) 60%, #6366f1) 100%)',
              }}
            >
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)',
                }}
              />
              {/* Close button */}
              {!isUploading && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            {/* Avatar ring — overlaps the header */}
            <div className="flex justify-center -mt-14 mb-4 relative z-10">
              <div className="relative">
                {/* Animated pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid var(--primary, #0d9488)', margin: '-6px' }}
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Avatar circle */}
                <div
                  className="w-24 h-24 rounded-full border-4 overflow-hidden flex items-center justify-center text-2xl font-black text-white shadow-xl"
                  style={{
                    borderColor: 'var(--surface, #1a1a2e)',
                    background: preview
                      ? 'transparent'
                      : 'linear-gradient(135deg, var(--primary, #0d9488), color-mix(in srgb, var(--primary, #0d9488) 50%, #6366f1))',
                  }}
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {/* Done checkmark */}
                {isDone && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: 'var(--primary, #0d9488)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3.5 3.5 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="px-6 pb-6 space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-black text-white">Add your professional photo</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text, #a0a0b0)', opacity: 0.7 }}>
                  {personName
                    ? `Looking great, ${personName.split(' ')[0]}! A photo makes your portfolio stand out.`
                    : 'A professional photo makes your portfolio stand out.'}
                </p>
              </div>

              {/* Drop zone */}
              {!isUploading && !isDone && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className="cursor-pointer rounded-2xl border-2 border-dashed transition-all p-6 flex flex-col items-center gap-3 select-none"
                  style={{
                    borderColor: isDragging
                      ? 'var(--primary, #0d9488)'
                      : preview
                      ? 'color-mix(in srgb, var(--primary, #0d9488) 40%, transparent)'
                      : 'rgba(255,255,255,0.1)',
                    background: isDragging
                      ? 'color-mix(in srgb, var(--primary, #0d9488) 8%, transparent)'
                      : preview
                      ? 'color-mix(in srgb, var(--primary, #0d9488) 5%, transparent)'
                      : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {preview ? (
                    <>
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--primary, #0d9488)' }}>
                        {selectedFile?.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text, #a0a0b0)', opacity: 0.5 }}>
                        Click to choose a different photo
                      </p>
                    </>
                  ) : (
                    <>
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'color-mix(in srgb, var(--primary, #0d9488) 12%, transparent)' }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--primary, #0d9488)' }}>
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">Drop your photo here</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text, #a0a0b0)', opacity: 0.5 }}>
                          or click to browse · JPG, PNG, WebP
                        </p>
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              {/* Progress bar */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--primary, #0d9488)' }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${Math.min(uploadProgress, 100)}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-center" style={{ color: 'var(--text, #a0a0b0)', opacity: 0.6 }}>
                    {isDone ? 'Done!' : 'Uploading your photo…'}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!isUploading && !isDone && (
                <div className="flex flex-col gap-2 pt-1">
                  <motion.button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{
                      background: selectedFile ? 'var(--primary, #0d9488)' : 'rgba(255,255,255,0.08)',
                      color: selectedFile ? 'white' : 'var(--text, #a0a0b0)',
                    }}
                    whileTap={selectedFile ? { scale: 0.97 } : {}}
                  >
                    Upload Photo
                  </motion.button>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 text-sm font-medium transition-colors rounded-xl"
                    style={{ color: 'var(--text, #a0a0b0)', opacity: 0.5 }}
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PhotoUploadModal;
