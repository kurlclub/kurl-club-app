import React, { useRef, useState } from 'react';

import { Eye, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';

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
  maxSize = 4 * 1024 * 1024,
  label = 'Upload Document',
  existingFileUrl,
}: FileUploaderProps) {
  const hasFile = file || existingFileUrl;

  const fileName = React.useMemo(() => {
    if (file) return file.name;
    if (existingFileUrl)
      return existingFileUrl.split('/').pop() || 'ID Document';
    return '';
  }, [file, existingFileUrl]);

  const fileSize = file?.size || null;

  const fileExtension = React.useMemo(() => {
    if (file) return file.type?.split('/')[1]?.toUpperCase() || 'FILE';
    if (existingFileUrl)
      return existingFileUrl.split('.').pop()?.toUpperCase() || 'FILE';
    return 'FILE';
  }, [file, existingFileUrl]);

  const isImageFile = React.useMemo(() => {
    const ext = fileExtension.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  }, [fileExtension]);

  const iconBgColor = isImageFile ? 'bg-blue-500' : 'bg-alert-red-500';
  const FileIcon = isImageFile ? ImageIcon : FileText;

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
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary-blue-400 border border-neutral-800">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <FileIcon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate max-w-[220px]">
                  {fileName || 'ID Document.pdf'}
                </p>
                <p className="text-xs text-gray-400">
                  {fileExtension}
                  {fileSize ? ` - ${(fileSize / 1024).toFixed(2)} KB` : ''}
                </p>
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
