import React, { useRef, useState } from 'react';

import { Eye, FileText, Upload, X } from 'lucide-react';

import { DocumentPreviewModal } from '@/components/shared/modals/document-preview-modal';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
  existingFileUrl?: string | null;
}

export default function FileUploader({
  file,
  onChange,
  accept = '.pdf,.jpg,.jpeg,.png',
  maxSize = 10 * 1024 * 1024,
  label = 'Upload Document',
  existingFileUrl,
}: FileUploaderProps) {
  const hasFile = file || existingFileUrl;
  const fileName = file
    ? file.name
    : existingFileUrl
      ? existingFileUrl.split('/').pop()
      : '';
  const fileSize = file ? file.size : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > maxSize) {
        alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
        return;
      }
      onChange(selectedFile);
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />

      {!hasFile ? (
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-secondary-blue-400 rounded-lg cursor-pointer bg-gray-50 dark:bg-secondary-blue-600/30 hover:bg-gray-100 dark:hover:bg-secondary-blue-600/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-300" />
            <p className="text-sm text-gray-500 dark:text-gray-300">
              <span className="font-semibold">{label}</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
              PDF, JPG, PNG (Max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
        </label>
      ) : (
        <>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-secondary-blue-600 border border-gray-200 dark:border-secondary-blue-400 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-5 h-5 text-gray-500 dark:text-gray-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                  {fileName}
                </p>
                {fileSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(fileSize / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {existingFileUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewOpen(true)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {existingFileUrl && (
            <DocumentPreviewModal
              open={previewOpen}
              onOpenChange={setPreviewOpen}
              documentUrl={existingFileUrl}
              title="Document Preview"
            />
          )}
        </>
      )}
    </div>
  );
}
