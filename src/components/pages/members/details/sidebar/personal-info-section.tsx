import { Fragment } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

import { Calendar } from 'lucide-react';

import { EditableFormField } from '@/components/shared/form/editable-form-field';
import { KDatePicker } from '@/components/shared/form/k-datepicker';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { relationOptions } from '@/lib/constants';
import { safeDateFormat, safeParseDate } from '@/lib/utils';
import type { EmergencyRelation, MemberDetails } from '@/types/member.types';

export interface EditableSectionProps {
  isEditing: boolean;
  details: MemberDetails | null;
  onUpdate: <K extends keyof MemberDetails>(
    key: K,
    value: MemberDetails[K]
  ) => void;
}

export function PersonalInfoSection({
  isEditing,
  details,
  onUpdate,
}: EditableSectionProps) {
  return (
    <Fragment>
      {/* CALENDER | DOB  */}
      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          DOB
        </Label>
        {isEditing ? (
          <KDatePicker
            icon={<Calendar />}
            mode="single"
            value={safeParseDate(details?.dob)}
            onDateChange={(date) =>
              onUpdate('dob', date instanceof Date ? date.toISOString() : '')
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

      {/* EMAIL  */}
      <EditableFormField
        type="input"
        label="Email"
        value={details?.email ?? undefined}
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

      <div className="py-3 flex flex-col gap-2">
        <Label className="text-primary-blue-100 font-normal text-sm leading-normal">
          Address
        </Label>
        {isEditing ? (
          <Textarea
            value={details?.fullAddress}
            onChange={(e) => onUpdate('fullAddress', e.target.value)}
            className="resize-none border-0 border-b border-primary-blue-300 k-transition rounded-none p-0 text-[15px]! focus:border-b-whit focus-visible:outline-0 hover:border-white focus-visible:border-b-white focus-visible:ring-0"
          />
        ) : (
          <p className="text-white text-[15px] leading-[140%] font-normal">
            {details?.fullAddress}
          </p>
        )}
      </div>

      {/* EMERGENCY_CONTACT_NAME  */}
      <EditableFormField
        type="input"
        label="Emergency Contact Name"
        value={details?.emergencyContactName}
        isEditing={isEditing}
        onChange={(value) => onUpdate('emergencyContactName', value)}
      />

      {/* EMERGENCY_CONTACT_PHONE  */}
      <EditableFormField
        type="input"
        label="Emergency Contact Phone"
        value={details?.emergencyContactPhone}
        isEditing={isEditing}
        onChange={(value) => onUpdate('emergencyContactPhone', value)}
        customInput={
          <PhoneInput
            defaultCountry="IN"
            international
            countryCallingCodeEditable={false}
            value={details?.emergencyContactPhone}
            onChange={(value) => onUpdate('emergencyContactPhone', value || '')}
            disabled={!isEditing}
            className="peer bg-transparent pb-1.5 border-b border-primary-blue-300 hover:border-white k-transition"
          />
        }
      />

      {/* EMERGENCY_CONTACT_RELATION  */}
      <EditableFormField
        type="select"
        label="Emergency Contact Relation"
        value={details?.emergencyContactRelation}
        isEditing={isEditing}
        onChange={(value) =>
          onUpdate('emergencyContactRelation', value as EmergencyRelation)
        }
        options={relationOptions}
      />
    </Fragment>
  );
}
