import * as React from 'react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Option {
  label: string;
  value: string;
}

export const KSelect = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Select> & {
    label?: string;
    options?: Option[];
    className?: string;
    size?: 'sm' | 'default';
    enableSearch?: boolean;
  }
>(
  (
    {
      label,
      value,
      onValueChange,
      options = [],
      className,
      size = 'default',
      enableSearch = false,
      ...props
    },
    ref
  ) => {
    const [hasValue, setHasValue] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredOptions = React.useMemo(() => {
      if (!enableSearch || !searchTerm.trim()) {
        return options;
      }

      const normalizedSearch = searchTerm.trim().toLowerCase();
      return options.filter((option) =>
        option.label.toLowerCase().includes(normalizedSearch)
      );
    }, [enableSearch, options, searchTerm]);

    React.useEffect(() => {
      setHasValue(!!value);
    }, [value]);

    return (
      <div ref={ref} className="relative w-full">
        <Select
          {...props}
          value={value}
          onValueChange={(val) => {
            setHasValue(!!val);
            if (onValueChange) onValueChange(val);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setSearchTerm('');
            }
            props.onOpenChange?.(open);
          }}
        >
          <SelectTrigger
            className={`peer ${className?.includes('bg-') ? 'shad-select-trigger-custom' : 'shad-select-trigger'}
            ${size === 'sm' ? 'h-11 px-3' : 'h-14 px-4'}
            ${hasValue ? (size === 'sm' ? 'pt-4' : 'pt-5') : 'pt-2'} ${className || ''}`}
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent className="shad-select-content">
            {enableSearch && (
              <div className="sticky top-0 z-10 px-2 py-2 bg-secondary-blue-700 border-b border-primary-blue-400">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                  placeholder="Search..."
                  className="w-full h-9 px-3 rounded-md border border-primary-blue-400 bg-secondary-blue-500 text-sm text-white placeholder:text-primary-blue-100 outline-none focus:border-primary-green-700"
                />
              </div>
            )}
            {filteredOptions.map((option) => (
              <SelectItem
                className="shad-select-item"
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-primary-blue-100">
                No results found.
              </div>
            )}
          </SelectContent>
        </Select>
        {label && (
          <label
            className={`absolute text-sm duration-300 text-primary-blue-100 transform -translate-y-3.5 scale-75 z-10 origin-[0] cursor-pointer
            ${size === 'sm' ? 'top-2.5 start-3' : 'top-4 start-4'}
            peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100
            ${
              hasValue
                ? size === 'sm'
                  ? '-translate-y-3.5 text-[12px] top-3.5'
                  : '-translate-y-3.5 text-sm  top-5'
                : size === 'sm'
                  ? 'translate-y-0 scale-90'
                  : 'translate-y-0 scale-100'
            }`}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
KSelect.displayName = 'KSelect';

{
  /* <KSelect
  label="Select Country"
  value={selectedCountry}
  onValueChange={(value) => onChange({ target: { name, value } })}
  options={[
    { label: 'India', value: 'IN' },
    { label: 'United States', value: 'US' },
    { label: 'Australia', value: 'AU' },
  ]}
  className="border-white! rounded-lg!"
/> */
}
