'use client';

import React, { useEffect, useRef, useState } from 'react';

import { CircleUser, Plus, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import CropModal from './crop-modal';
import PreviewModal from './preview-modal';

interface ProfilePictureUploaderProps {
  files: File | null;
  onChange: (file: File | null) => void;
  isSmall?: boolean;
  existingImageUrl?: string | null;
  readonly?: boolean;
}

export default function ProfilePictureUploader({
  files,
  onChange,
  isSmall,
  existingImageUrl,
}: ProfilePictureUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update the image state when `files` or `existingImageUrl` changes
  useEffect(() => {
    let newImage: string | null = null;

    if (files) {
      newImage = URL.createObjectURL(files);
    } else if (existingImageUrl) {
      newImage = existingImageUrl;
    }

    setImage(newImage);
  }, [files, existingImageUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target?.result as string);
        setImage(null); // Clear the existing image
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = async (croppedImage: string) => {
    if (currentFile) {
      // Convert base64 to blob
      const response = await fetch(croppedImage);
      const blob = await response.blob();

      // Create File from blob with original filename
      const croppedFile = new File([blob], currentFile.name, {
        type: currentFile.type,
      });

      setImage(croppedImage);
      setCropModalOpen(false);
      onChange(croppedFile); // Pass the cropped file to the parent
    }
  };

  const handleDelete = () => {
    setImage(null);
    setPreviewModalOpen(false);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onChange(null);
  };

  const handleReupload = () => {
    setPreviewModalOpen(false);
    setImage(null);
    setTempImage(null);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      {image ? (
        <Avatar
          className={`${isSmall ? 'size-16' : 'size-[92px]'} cursor-pointer rounded-lg`}
          onClick={() => setPreviewModalOpen(true)}
        >
          <AvatarImage src={image} alt="Profile picture" />
          <AvatarFallback>
            <User className="w-16 h-16" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <Button
          variant="outline"
          size="icon"
          className={`${isSmall ? 'size-16' : 'size-[92px]'} bg-secondary-blue-400 rounded-lg hover:bg-secondary-blue-500 relative`}
          onClick={() => fileInputRef.current?.click()}
        >
          <CircleUser
            className={`${isSmall ? 'size-8!' : 'size-11!'} text-secondary-blue-100`}
          />
          <span
            className={`absolute bottom-0 right-0 ${isSmall ? 'size-5' : 'size-6'} p-1 bg-primary-green-500 flex justify-center items-center rounded-lg`}
          >
            <Plus
              className={` ${isSmall ? 'size-2!' : 'size-3!'} text-secondary-blue-500`}
            />
          </span>
        </Button>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />
      <CropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        src={tempImage}
        onCrop={handleCrop}
      />
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        src={image}
        onDelete={handleDelete}
        onReupload={handleReupload}
        readonly
      />
    </div>
  );
}
