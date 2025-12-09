import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Base props shared by all field types
interface BaseEditableFieldProps {
  label: string;
  isEditing: boolean;
}

// Text/Number Input Field
interface EditableInputFieldProps extends BaseEditableFieldProps {
  type: 'input';
  value?: string | number;
  onChange: (value: string) => void;
  suffix?: string;
  customInput?: React.ReactNode;
}

// Select Field
interface EditableSelectFieldProps<
  T extends string = string,
> extends BaseEditableFieldProps {
  type: 'select';
  value?: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string; avatar?: string }>;
}

type EditableFormFieldProps =
  | EditableInputFieldProps
  | EditableSelectFieldProps;

export function EditableFormField(props: EditableFormFieldProps) {
  const { label, isEditing, type } = props;

  if (type === 'input') {
    const { value, onChange, suffix, customInput } = props;
    const displayValue =
      typeof value === 'number' && value === 0 ? '' : (value ?? '');

    return (
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          {label}
        </Label>
        {isEditing ? (
          customInput ? (
            customInput
          ) : (
            <div className="flex items-center pb-1.5 border-b gap-2 border-primary-blue-300 group focus-within:border-white hover:border-white k-transition">
              <Input
                maxLength={suffix ? 6 : undefined}
                value={displayValue}
                onChange={(e) => onChange(e.target.value)}
                className="border-0 rounded-none h-auto p-0 text-[15px]! focus-visible:outline-0 focus-visible:ring-0"
              />
              {suffix && (
                <span className="text-white text-[15px] leading-[140%] font-normal">
                  {suffix}
                </span>
              )}
            </div>
          )
        ) : (
          <div className="flex items-center gap-1">
            <p className="text-white text-[15px] leading-[140%] font-normal">
              {displayValue}
            </p>
            {suffix && (
              <span className="block text-white text-[15px] leading-[140%] font-normal">
                {suffix}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (type === 'select') {
    const { value, onChange, options } = props;

    return (
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          {label}
        </Label>
        {isEditing ? (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="border-0 border-b rounded-none focus:outline-hidden focus:shadow-none focus:ring-0 p-0 h-auto text-[15px] text-white font-normal leading-normal pb-2 border-primary-blue-300 focus:border-white hover:border-white k-transition focus:outline-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="shad-select-content">
              {options.map((option) => (
                <SelectItem
                  className="shad-select-item"
                  key={option.value}
                  value={option.value}
                >
                  <div className="flex items-center gap-2">
                    {option.avatar && (
                      <span className="w-6 h-6 flex items-center justify-center">
                        <Image
                          height={24}
                          width={24}
                          src={option.avatar}
                          alt={option.label}
                          className="rounded-full object-cover"
                        />
                      </span>
                    )}
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {value}
          </p>
        )}
      </div>
    );
  }

  return null;
}
