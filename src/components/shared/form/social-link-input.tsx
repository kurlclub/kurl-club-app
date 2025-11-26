'use client';

import { useEffect, useState } from 'react';

import { WebsiteIcon } from '@/components/shared/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type SocialPlatform,
  detectSocialPlatform,
  validateSocialUrl,
} from '@/lib/utils/social-icons';

interface SocialLinkInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function SocialLinkInput({
  value = '',
  onChange,
  label = 'Website Link',
  placeholder = 'https://www.google.com',
  className,
}: SocialLinkInputProps) {
  const [platform, setPlatform] = useState<SocialPlatform | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (value) {
      const detected = detectSocialPlatform(value);
      setPlatform(detected);
      setIsValid(validateSocialUrl(value));
    } else {
      setPlatform(null);
      setIsValid(true);
    }
  }, [value]);

  const Icon = platform?.icon || WebsiteIcon;

  return (
    <div className="space-y-2">
      <Label className="text-primary-blue-100 text-sm font-normal leading-normal">
        {label}
      </Label>
      <div className="relative mt-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-primary-blue-300" />
        </div>
        <Input
          type="url"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={`k-input pl-10 bg-secondary-blue-500 border-secondary-blue-400 text-white placeholder:text-primary-blue-300 h-[52px] ${!isValid ? 'border-red-500' : ''} ${className}`}
        />
      </div>
      {!isValid && value && (
        <p className="text-sm text-red-500">Please enter a valid URL</p>
      )}
    </div>
  );
}
