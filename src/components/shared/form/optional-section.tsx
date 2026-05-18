import React, { useState } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

interface OptionalSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const OptionalSection: React.FC<OptionalSectionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-secondary-blue-400 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-secondary-blue-600/30 hover:bg-secondary-blue-600/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">{title}</span>
          <span className="text-xs text-gray-400">(Optional)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4 bg-secondary-blue-600/10">{children}</div>
      )}
    </div>
  );
};
