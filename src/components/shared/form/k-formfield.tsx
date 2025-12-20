'use client';

import { forwardRef } from 'react';
import {
  Control,
  ControllerRenderProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { KDatePicker as UIDatePicker } from '@kurlclub/ui-components';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { E164Number } from 'libphonenumber-js/core';

import { KDateInput } from '@/components/shared/form/k-date-input';
import { KDatePicker } from '@/components/shared/form/k-datepicker';
import { KInput } from '@/components/shared/form/k-input';
import { KMultiSelect } from '@/components/shared/form/k-multi-select';
import { KPassword } from '@/components/shared/form/k-password';
import { KSelect } from '@/components/shared/form/k-select';
import { KTextarea } from '@/components/shared/form/k-textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { safeParseDate } from '@/lib/utils';

const CustomPhoneInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    ref={ref}
    onFocus={(e) => {
      props.onFocus?.(e);
      requestAnimationFrame(() => {
        e.target.setSelectionRange(
          e.target.value.length,
          e.target.value.length
        );
      });
    }}
  />
));

CustomPhoneInput.displayName = 'CustomPhoneInput';

export enum KFormFieldType {
  INPUT = 'input',
  TEXTAREA = 'textarea',
  PASSWORD = 'password',
  PHONE_INPUT = 'phoneInput',
  CHECKBOX = 'checkbox',
  DATE_PICKER = 'datePicker',
  UI_DATE_PICKER = 'uidatePicker',
  DATE_INPUT = 'dateInput',
  SELECT = 'select',
  MULTISELECT = 'multiSelect',
  OTP = 'otp',
  SKELETON = 'skeleton',
}

interface Option {
  label: string;
  value: string;
}

interface CustomProps<T extends FieldValues> {
  control: Control<T>;
  fieldType: KFormFieldType;
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  iconSrc?: React.ReactNode;
  disabled?: boolean;
  dateFormat?: string;
  numberOfMonths?: number;
  mode?: 'range' | 'single';
  dateLabel?: string;
  floating?: boolean;
  showPresets?: boolean;
  showYearSelector?: boolean;
  children?: React.ReactNode;
  className?: string;
  suffix?: string;
  maxLength?: number;
  mandetory?: boolean;
  options?: Option[];
  size?: 'sm' | 'default';
  renderSkeleton?: (
    field: ControllerRenderProps<T, FieldPath<T>>
  ) => React.ReactNode;
  type?: React.InputHTMLAttributes<HTMLInputElement>['type'];
}

const RenderField = <T extends FieldValues>({
  field,
  props,
}: {
  field: ControllerRenderProps<T, FieldPath<T>>;
  props: CustomProps<T>;
}) => {
  const {
    fieldType,
    placeholder,
    renderSkeleton,
    children,
    name,
    label,
    iconSrc,
    numberOfMonths,
    dateLabel,
    floating,
    mode,
    showPresets,
    showYearSelector,
    className,
    suffix,
    maxLength,
    mandetory,
    size,
    type,
  } = props;

  switch (fieldType) {
    case KFormFieldType.INPUT:
      return (
        <FormControl>
          <div className="flex items-stretch">
            {iconSrc && (
              <div className="mr-2 bg-secondary-blue-600 h-[52px] w-[52px] p-2 rounded-md flex items-center justify-center">
                {iconSrc}
              </div>
            )}
            <div className="grow">
              <KInput
                label={label ?? 'Input'}
                id={name}
                placeholder=" "
                {...field}
                disabled={props.disabled}
                className={className}
                suffix={suffix}
                maxLength={maxLength}
                mandetory={mandetory}
                size={size}
                type={type}
              />
            </div>
          </div>
        </FormControl>
      );

    case KFormFieldType.TEXTAREA:
      return (
        <FormControl>
          <KTextarea
            label={label ?? 'Textarea'}
            id={name}
            placeholder=" "
            {...field}
            disabled={props.disabled}
            maxLength={maxLength}
          />
        </FormControl>
      );

    case KFormFieldType.PASSWORD:
      return (
        <FormControl>
          <KPassword
            label={label ?? 'Textarea'}
            id={name}
            placeholder=" "
            {...field}
            disabled={props.disabled}
          />
        </FormControl>
      );

    case KFormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <PhoneInput
            defaultCountry="IN"
            placeholder={placeholder}
            international
            withCountryCallingCode
            value={field.value as E164Number | undefined}
            onChange={field.onChange}
            className={`peer ${className ? className : 'input-phone'}`}
            countrySelectProps={{
              className: 'country-select',
              tabIndex: -1,
            }}
            smartCaret={false}
            inputComponent={CustomPhoneInput}
          />
        </FormControl>
      );

    case KFormFieldType.SELECT:
      return (
        <FormControl>
          <KSelect
            value={field.value}
            onValueChange={field.onChange}
            label={label}
            options={props.options}
            className={className}
            size={size}
          >
            {children}
          </KSelect>
        </FormControl>
      );

    case KFormFieldType.MULTISELECT:
      return (
        <FormControl>
          <KMultiSelect
            options={props.options ?? []}
            selected={field.value || []}
            onChange={field.onChange}
            placeholder={props.placeholder}
            disabled={props.disabled}
          />
        </FormControl>
      );

    case KFormFieldType.OTP:
      return (
        <FormControl>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={field.value}
            onChange={field.onChange}
          >
            <InputOTPGroup className="shad-otp">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  className="shad-otp-slot"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </FormControl>
      );

    case KFormFieldType.DATE_PICKER:
      return (
        <FormControl>
          <KDatePicker
            numberOfMonths={numberOfMonths}
            label={floating ? label : dateLabel}
            floating={floating}
            showPresets={showPresets}
            showYearSelector={showYearSelector}
            onDateChange={(date) => {
              if (mode === 'single' && date instanceof Date) {
                field.onChange(date.toISOString());
              } else {
                field.onChange(date);
              }
            }}
            value={
              mode === 'single' && typeof field.value === 'string'
                ? safeParseDate(field.value)
                : field.value
            }
            mode={mode ?? 'range'}
            className={className}
            icon={iconSrc}
          />
        </FormControl>
      );

    case KFormFieldType.UI_DATE_PICKER:
      return (
        <FormControl>
          <UIDatePicker
            captionLayout="dropdown"
            numberOfMonths={numberOfMonths}
            label={floating ? label : dateLabel}
            floating={floating}
            showPresets={showPresets}
            showYearSelector={showYearSelector}
            onDateChange={(date) => {
              if (mode === 'single' && date instanceof Date) {
                field.onChange(date.toISOString());
              } else {
                field.onChange(date);
              }
            }}
            value={
              mode === 'single' && typeof field.value === 'string'
                ? safeParseDate(field.value)
                : field.value
            }
            mode={mode ?? 'range'}
            className={className}
            icon={iconSrc}
          />
        </FormControl>
      );

    case KFormFieldType.DATE_INPUT:
      return (
        <FormControl>
          <KDateInput
            label={label ?? 'Date'}
            id={name}
            {...field}
            disabled={props.disabled}
            className={className}
            size={size}
          />
        </FormControl>
      );

    case KFormFieldType.CHECKBOX:
      return (
        <FormControl>
          <div className="flex items-center gap-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={props.disabled}
            />
            <label htmlFor={name} className="checkbox-label">
              {label}
            </label>
          </div>
        </FormControl>
      );

    case KFormFieldType.SKELETON:
      return renderSkeleton ? renderSkeleton(field) : null;

    default:
      return null;
  }
};

export function KFormField<T extends FieldValues>(props: CustomProps<T>) {
  const { control, fieldType, name, label } = props;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          {fieldType === KFormFieldType.SKELETON && label && (
            <FormLabel>{label}</FormLabel>
          )}

          <RenderField field={field} props={props} />
          <FormMessage className="text-alert-red-400 before:content-['*'] before:mr-px" />
        </FormItem>
      )}
    />
  );
}
