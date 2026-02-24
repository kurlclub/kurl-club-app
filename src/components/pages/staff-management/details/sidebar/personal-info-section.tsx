import { Fragment } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Calendar } from 'lucide-react';

import { EditableFormField } from '@/components/shared/form/editable-form-field';
import { KDatePicker } from '@/components/shared/form/k-datepicker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { bloodGroupOptions } from '@/lib/constants';
import {
  safeDateFormat,
  safeParseDate,
  toUtcDateOnlyISOString,
} from '@/lib/utils';
import type { EditableSectionProps } from '@/types/staff';

export function PersonalInfoSection({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  return (
    <Fragment>
      {/* EMAIL  */}
      <EditableFormField
        type="input"
        label="Email"
        value={details?.email}
        isEditing={isEditing}
        onChange={(value) => onUpdate('email', value)}
      />

      {/* PHONE_NUMBER  */}
      <EditableFormField
        type="input"
        label="Mobile"
        value={details?.phone}
        isEditing={isEditing}
        onChange={(value) => onUpdate('phone', value || '')}
        customInput={
          <PhoneInput
            defaultCountry="IN"
            international
            countryCallingCodeEditable={false}
            value={details?.phone}
            onChange={(value) => onUpdate('phone', value || '')}
            disabled={!isEditing}
            className="peer bg-transparent pb-1.5 border-b border-primary-blue-300 hover:border-white k-transition"
          />
        }
      />

      {/* DOB  */}
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Date of Birth
        </Label>
        {isEditing ? (
          <KDatePicker
            icon={<Calendar />}
            mode="single"
            value={safeParseDate(details?.dob)}
            onDateChange={(date) =>
              onUpdate(
                'dob',
                date instanceof Date ? toUtcDateOnlyISOString(date) : ''
              )
            }
            label="Date of birth"
            className="bg-transparent border-0 border-b border-primary-blue-300 rounded-none hover:bg-transparent hover:border-white k-transition p-0 h-auto w-full pb-1.5 text-white text-[15px] leading-[140%] font-normal gap-1 flex-row-reverse justify-between"
          />
        ) : (
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {safeDateFormat(details?.dob)}
          </p>
        )}
      </div>

      {/* DOJ  */}
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Date of Joining
        </Label>
        {isEditing ? (
          <KDatePicker
            icon={<Calendar />}
            mode="single"
            value={safeParseDate(details?.doj)}
            onDateChange={(date) =>
              onUpdate(
                'doj',
                date instanceof Date ? toUtcDateOnlyISOString(date) : ''
              )
            }
            label="Date of joining"
            className="bg-transparent border-0 border-b border-primary-blue-300 rounded-none hover:bg-transparent hover:border-white k-transition p-0 h-auto w-full pb-1.5 text-white text-[15px] leading-[140%] font-normal gap-1 flex-row-reverse justify-between"
          />
        ) : (
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {safeDateFormat(details?.doj)}
          </p>
        )}
      </div>

      {/* ADDRESS  */}
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Address
        </Label>
        {isEditing ? (
          <Textarea
            value={details?.addressLine}
            onChange={(e) => onUpdate('addressLine', e.target.value)}
            className="resize-none border-0 border-b border-primary-blue-300 k-transition rounded-none p-0 text-[15px]! focus:border-b-whit focus-visible:outline-0 hover:border-white focus-visible:border-b-white focus-visible:ring-0"
          />
        ) : (
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {details?.addressLine}
          </p>
        )}
      </div>

      {/* BLOOD_GROUP  */}
      <EditableFormField
        type="select"
        label="Blood Group"
        value={details?.bloodGroup}
        isEditing={isEditing}
        onChange={(value) => onUpdate('bloodGroup', value)}
        options={bloodGroupOptions}
      />
    </Fragment>
  );
}
