import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import KDialog from '@/components/shared/form/k-dialog';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  onDelete: () => void;
  onReupload: () => void;
  readonly?: boolean;
}

export default function PreviewModal({
  isOpen,
  onClose,
  src,
  onReupload,
  readonly = false,
}: PreviewModalProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const isImageLoading = isOpen && src && !isImageLoaded;

  return (
    <KDialog
      footer={
        readonly ? undefined : (
          <div className="flex items-center gap-2 w-full">
            {/* <Button variant="destructive" onClick={onDelete} className="flex-1">
              Delete
            </Button> */}
            <Button onClick={onReupload} className="flex-1">
              Re-upload
            </Button>
          </div>
        )
      }
      open={isOpen}
      onOpenChange={onClose}
      title="Profile Picture"
      className="max-w-100"
    >
      {src && (
        <div className="relative flex items-center justify-center py-4 min-h-40">
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary-blue-500/30 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-white/80" />
            </div>
          )}
          <Image
            src={src}
            alt="Profile picture"
            width={400}
            height={400}
            className={`max-w-full max-h-[60vh] object-contain rounded-lg transition-opacity ${
              isImageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            style={{ width: 'auto', height: 'auto' }}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(true)}
          />
        </div>
      )}
    </KDialog>
  );
}
