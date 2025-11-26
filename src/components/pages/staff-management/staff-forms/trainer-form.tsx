'use client';

import { useFormContext } from 'react-hook-form';

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
      <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Gender */}
        <div className="w-full sm:w-1/2">
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="Gender"
            label="Gender"
            options={genderOptions}
            disabled={isSubmitting}
          />
        </div>

        {/* Blood Group */}
        <div className="w-full sm:w-1/2">
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="BloodGroup"
            label="Blood Group"
            options={bloodGroupOptions}
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Date of joining */}
        <div className="w-full sm:w-1/2">
          <KFormField
            fieldType={KFormFieldType.DATE_PICKER}
            control={form.control}
            name="Doj"
            label="Date of joining"
            mode="single"
            floating
            disabled={isSubmitting}
          />
        </div>

        {/* Date of birth */}
        <div className="w-full sm:w-1/2">
          <KFormField
            fieldType={KFormFieldType.DATE_INPUT}
            control={form.control}
            name="Dob"
            label="Date of birth"
            disabled={isSubmitting}
          />
        </div>
      </div>
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
      />
    </>
  );
}
