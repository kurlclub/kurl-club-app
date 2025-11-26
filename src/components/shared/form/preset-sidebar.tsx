import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PresetSidebarProps {
  presets: string[];
  activePreset: string | null;
  onSelectPreset: (preset: string) => void;
  years: number[];
  currentYear: string;
  onYearChange: (year: string) => void;
}

const PresetSidebar: React.FC<PresetSidebarProps> = ({
  presets,
  activePreset,
  onSelectPreset,
  years,
  currentYear,
  onYearChange,
}) => {
  return (
    <div className="flex flex-col bg-secondary-blue-800 border-r border-primary-blue-400 rounded-tl-md rounded-bl-md min-w-[174px] max-w-[174px]">
      {/* Year Selector */}
      <div className="p-2 border-b border-primary-blue-400">
        <Select onValueChange={onYearChange} value={currentYear}>
          <SelectTrigger className="bg-secondary-blue-500 text-white placeholder:text-white border-0 appearance-none focus:outline-hidden focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            {years.map((year) => (
              <SelectItem
                key={year}
                value={year.toString()}
                className="shad-select-item"
              >
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Preset Buttons */}
      {presets.map((preset) => (
        <button
          key={preset}
          onClick={() => onSelectPreset(preset)}
          className={cn(
            'px-4 py-3 text-[13px] text-left text-white hover:text-primary-green-500 hover:bg-secondary-blue-600 k-transition',
            activePreset === preset
              ? 'bg-secondary-blue-600 text-primary-green-500'
              : 'bg-transparent'
          )}
          aria-label={`Select ${preset} preset`}
        >
          {preset}
        </button>
      ))}
    </div>
  );
};

export default PresetSidebar;
