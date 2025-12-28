'use client';

import { useFormContext } from 'react-hook-form';

import { FieldColumn, FieldRow } from '@/components/shared/form/field-layout';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { FormControl } from '@/components/ui/form';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { bloodGroupOptions, genderOptions } from '@/lib/constants';

interface TrainerFormProps {
  gymId?: number;
  isSubmitting: boolean;
}

export default function TrainerForm({ gymId, isSubmitting }: TrainerFormProps) {
  const { formOptions } = useGymFormOptions(gymId);
  const form = useFormContext();

  return (
    <>
      {/* Profile picture */}
      <div className="mb-6">
        <KFormField
          fieldType={KFormFieldType.SKELETON}
          control={form.control}
          name="ProfilePicture"
          renderSkeleton={(field) => (
            <FormControl>
              <ProfilePictureUploader
                files={field.value as File | null}
                onChange={(file) => field.onChange(file)}
              />
            </FormControl>
          )}
        />
      </div>
      <h5 className="text-white text-base font-normal leading-normal mt-0!">
        Basic Details
      </h5>
      {/* Name */}
      <KFormField
        control={form.control}
        name="TrainerName"
        fieldType={KFormFieldType.INPUT}
        label="Full Name"
        placeholder="John Doe"
        disabled={isSubmitting}
        maxLength={30}
      />
      {/* Email */}
      <KFormField
        control={form.control}
        name="Email"
        fieldType={KFormFieldType.INPUT}
        label="Email"
        placeholder="john@example.com"
        disabled={isSubmitting}
      />
      {/* Phone number */}
      <KFormField
        control={form.control}
        name="Phone"
        fieldType={KFormFieldType.PHONE_INPUT}
        label="Phone Number"
        disabled={isSubmitting}
      />
      <FieldRow>
        <FieldColumn>
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="Gender"
            label="Gender"
            options={genderOptions}
            disabled={isSubmitting}
          />
        </FieldColumn>
        <FieldColumn>
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="BloodGroup"
            label="Blood Group"
            options={bloodGroupOptions}
            disabled={isSubmitting}
          />
        </FieldColumn>
      </FieldRow>
      <FieldRow>
        <FieldColumn>
          <KFormField
            fieldType={KFormFieldType.UI_DATE_PICKER}
            control={form.control}
            name="Doj"
            label="Date of joining"
            mode="single"
            floating
            disabled={isSubmitting}
          />
        </FieldColumn>
        <FieldColumn>
          <KFormField
            fieldType={KFormFieldType.DATE_INPUT}
            control={form.control}
            name="Dob"
            label="Date of birth"
            disabled={isSubmitting}
          />
        </FieldColumn>
      </FieldRow>
      <KFormField
        fieldType={KFormFieldType.MULTISELECT}
        control={form.control}
        name="Certification"
        label="Certifications"
        placeholder="List relevant certifications (e.g., NASM, ACE, ISSA)"
        options={
          formOptions?.certificatesOptions
            ? formOptions.certificatesOptions.map((certificate) => ({
                label: certificate.name,
                value: String(certificate.id),
              }))
            : []
        }
        disabled={isSubmitting}
      />

      {/* User Credentials */}
      <h5 className="text-white text-base font-normal leading-normal mt-8!">
        User Credentials
      </h5>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <input
          name="__fake_username"
          type="text"
          autoComplete="username"
          tabIndex={-1}
        />
        <input
          name="__fake_password"
          type="password"
          autoComplete="new-password"
          tabIndex={-1}
        />
      </div>
      <KFormField
        control={form.control}
        name="Username"
        fieldType={KFormFieldType.INPUT}
        label="Username (Email)"
        placeholder="trainer@example.com"
        disabled={isSubmitting}
        autoComplete="off"
        type="email"
      />
      <KFormField
        control={form.control}
        name="Password"
        fieldType={KFormFieldType.PASSWORD}
        label="Password"
        placeholder="Enter password"
        disabled={isSubmitting}
        autoComplete="new-password"
      />

      {/* Address Details */}
      <h5 className="text-white text-base font-normal leading-normal mt-8!">
        Address Details
      </h5>
      <KFormField
        fieldType={KFormFieldType.TEXTAREA}
        control={form.control}
        name="AddressLine"
        label="Address Line"
        disabled={isSubmitting}
        maxLength={250}
      />
    </>
  );
}
