import Image from 'next/image';

import KDialog from '@/components/shared/form/k-dialog';
import { Button } from '@/components/ui/button';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  onDelete: () => void;
  onReupload: () => void;
}

export default function PreviewModal({
  isOpen,
  onClose,
  src,
  onDelete,
  onReupload,
}: PreviewModalProps) {
  return (
    <KDialog
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="destructive" onClick={onDelete} className="flex-1">
            Delete
          </Button>
          <Button onClick={onReupload} className="flex-1">
            Re-upload
          </Button>
        </div>
      }
      open={isOpen}
      onOpenChange={onClose}
      title="Profile Picture"
      className="max-w-[400px]"
    >
      {src && (
        <div className="flex items-center justify-center py-4">
          <Image
            src={src}
            alt="Profile picture"
            width={400}
            height={400}
            className="max-w-full max-h-[60vh] object-contain rounded-lg"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      )}
    </KDialog>
  );
}
