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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onReupload}>Re-upload</Button>
        </div>
      }
      open={isOpen}
      onOpenChange={onClose}
      title="Profile Picture Preview"
      className="max-w-[500px]"
    >
      {src && (
        <div className="flex justify-center">
          <Image
            src={src}
            alt="Profile picture"
            width={250}
            height={250}
            className="rounded-full"
          />
        </div>
      )}
    </KDialog>
  );
}
