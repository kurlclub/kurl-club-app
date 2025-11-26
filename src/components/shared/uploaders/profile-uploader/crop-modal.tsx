'use client';

import Image from 'next/image';
import React, { useCallback, useState } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import KDialog from '@/components/shared/form/k-dialog';
import { Button } from '@/components/ui/button';

interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | null;
  onCrop: (croppedImage: string) => void;
  onUpload?: (imageData: string) => Promise<void>;
}

export default function CropModal({
  isOpen,
  onClose,
  src,
  onCrop,
  onUpload,
}: CropModalProps) {
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);

  const ASPECT_RATIO = 1; // Fixed aspect ratio (e.g., 1 for square)

  const onImageLoad = useCallback((image: HTMLImageElement) => {
    setImageRef(image);
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        ASPECT_RATIO,
        image.naturalWidth,
        image.naturalHeight
      ),
      image.naturalWidth,
      image.naturalHeight
    );
    setCrop(initialCrop);
  }, []);

  const getCroppedImg = useCallback(
    async (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
      if (!crop || !image) {
        throw new Error('Invalid crop or image.');
      }

      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context.');
      }

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      return new Promise<string>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas is empty.'));
              return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
          },
          'image/jpeg',
          0.9
        );
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (completedCrop && imageRef) {
      try {
        const croppedImageData = await getCroppedImg(imageRef, completedCrop);
        onCrop(croppedImageData);
        if (onUpload) await onUpload(croppedImageData);
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  }, [completedCrop, getCroppedImg, imageRef, onCrop, onUpload, onClose]);

  return (
    <KDialog
      footer={<Button onClick={handleCropComplete}>Crop & Upload</Button>}
      className="w-[500px]"
      open={isOpen}
      onOpenChange={onClose}
      title="Crop Image"
    >
      {src && (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={ASPECT_RATIO}
        >
          <Image
            src={src}
            onLoad={(e) => onImageLoad(e.currentTarget)}
            alt="Crop me"
            layout="responsive"
            width={100}
            height={100}
          />
        </ReactCrop>
      )}
    </KDialog>
  );
}
