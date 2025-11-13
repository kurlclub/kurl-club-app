import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import {
  bloodGroupOptions,
  feeStatusOptions,
  genderOptions,
} from '@/lib/constants';
import { createMemberSchema } from '@/schemas/index';
import { createMember } from '@/services/member';

type CreateMemberDetailsData = z.infer<typeof createMemberSchema>;

type CreateMemberDetailsProps = {
  onSubmit?: (data: CreateMemberDetailsData) => void;
  closeSheet: () => void;
  isOpen: boolean;
  gymId?: number;
};

export const AddMember: React.FC<CreateMemberDetailsProps> = ({
  isOpen,
  closeSheet,
  gymId,
}) => {
  const form = useForm<CreateMemberDetailsData>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      profilePicture: null,
      name: '',
      email: '',
      phone: '',
      amountPaid: '',
      dob: '',
      doj: new Date().toISOString(),
      height: '',
      weight: '',
      address: '',
      gender: '',
      membershipPlanId: '',
      feeStatus: '',
      personalTrainer: 0,
      bloodGroup: '',
      workoutPlanId: '',
      modeOfPayment: '',
      customSessionRate: '',
    },
  });

  // Fetch form options based on gymId
  const { formOptions } = useGymFormOptions(gymId);

  const queryClient = useQueryClient();

  const handleSubmit = async (data: CreateMemberDetailsData) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'profilePicture' && value instanceof File) {
        return formData.append(key, value);
      }

      if (key === 'personalTrainer') {
        return formData.append(key, value === '' ? '0' : String(value));
      }

      formData.append(key, String(value));
    });

    if (gymId) {
      formData.append('gymId', String(gymId));
    }

    const result = await createMember(formData);

    if (result.success) {
      toast.success(result.success);

      // Invalidate and refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['gymMembers', gymId] });

      closeSheet();
      form.reset();
    } else {
      toast.error(result.error);
    }
  };

  const memberDetails = { name: 'John Doe', gymNo: '38545' };

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        onClick={() => {
          form.reset();
          closeSheet();
        }}
        variant="secondary"
        className="h-[46px] min-w-[90px]"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-member-form"
        className="h-[46px] min-w-[73px]"
      >
        Add
      </Button>
    </div>
  );

  return (
    <KSheet
      className="w-[450px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title="Add Member"
      footer={footer}
    >
      <FormProvider {...form}>
        <form
          id="add-member-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className="items-start gap-2 mb-6 flex justify-between ">
            <KFormField
              fieldType={KFormFieldType.SKELETON}
              control={form.control}
              name="profilePicture"
              renderSkeleton={(field) => (
                <FormControl>
                  <ProfilePictureUploader
                    files={field.value as File | null}
                    onChange={(file) => field.onChange(file)}
                  />
                </FormControl>
              )}
            />
            <Badge className="bg-secondary-blue-400 flex items-center w-fit justify-center text-sm text-white rounded-full h-[30px] py-2 px-2 border border-secondary-blue-300 bg-opacity-100">
              Gym no: #{memberDetails.gymNo}
            </Badge>
          </div>
          <h5 className="text-white text-base font-normal leading-normal mt-0!">
            Basic Details
          </h5>
          {/* Member Name */}
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="name"
            label="Member Name"
          />

          {/* Email */}
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="email"
            label="Email"
          />

          {/* Phone */}
          <KFormField
            fieldType={KFormFieldType.PHONE_INPUT}
            control={form.control}
            name="phone"
            label="Phone"
            placeholder="(555) 123-4567"
          />

          {/* Gender */}
          <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="gender"
                label="Gender"
                options={genderOptions}
              />
            </div>

            {/* Package */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="membershipPlanId"
                label="Package"
                options={formOptions?.membershipPlans.map((plan) => ({
                  label: plan.planName,
                  value: String(plan.membershipPlanId),
                }))}
              />
            </div>
          </div>
          <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* height */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="height"
                label="Height (In Centimeters)"
              />
            </div>

            {/* weight */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.INPUT}
                control={form.control}
                name="weight"
                label="Weight (In Kilograms)"
              />
            </div>
          </div>

          {/* Fee Status & Amount Paid - Only for Recurring plans */}
          {(() => {
            const selectedPlanId = form.watch('membershipPlanId');
            const selectedPlan = formOptions?.membershipPlans.find(
              (plan) => String(plan.membershipPlanId) === selectedPlanId
            );

            // Check if plan name contains 'session' or 'per session' as fallback
            const isPerSession =
              selectedPlan?.billingType === 'PerSession' ||
              selectedPlan?.planName?.toLowerCase().includes('session');

            if (!selectedPlan || !isPerSession) {
              return (
                <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
                  {/* Fee Status */}
                  <div className="w-full sm:w-1/2 ">
                    <KFormField
                      fieldType={KFormFieldType.SELECT}
                      control={form.control}
                      name="feeStatus"
                      label="Fee Status"
                      options={feeStatusOptions}
                    />
                  </div>

                  {/* Amount Paid */}
                  <div className="w-full sm:w-1/2 ">
                    {(() => {
                      const planFeeSuffix = selectedPlan
                        ? `/ ${selectedPlan.fee.toLocaleString()}`
                        : '';

                      return (
                        <KFormField
                          suffix={planFeeSuffix}
                          fieldType={KFormFieldType.INPUT}
                          control={form.control}
                          name="amountPaid"
                          label="Amount Paid"
                          maxLength={10}
                        />
                      );
                    })()}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Custom Session Rate - Only for PerSession plans */}
          {(() => {
            const selectedPlanId = form.watch('membershipPlanId');
            const selectedPlan = formOptions?.membershipPlans.find(
              (plan) => String(plan.membershipPlanId) === selectedPlanId
            );

            // Check if plan name contains 'session' or 'per session' as fallback
            const isPerSession =
              selectedPlan?.billingType === 'PerSession' ||
              selectedPlan?.planName?.toLowerCase().includes('session');

            if (isPerSession && selectedPlan) {
              return (
                <div className="space-y-2">
                  <KFormField
                    fieldType={KFormFieldType.INPUT}
                    control={form.control}
                    name="customSessionRate"
                    label="Custom Session Rate (Optional)"
                    placeholder={`Default: ₹${selectedPlan.fee}`}
                    type="number"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Leave empty to use plan&apos;s default rate of ₹
                    {selectedPlan.fee} per session
                  </p>
                </div>
              );
            }
            return null;
          })()}

          {/* Mode of Payment - Only for Recurring plans */}
          {(() => {
            const selectedPlanId = form.watch('membershipPlanId');
            const selectedPlan = formOptions?.membershipPlans.find(
              (plan) => String(plan.membershipPlanId) === selectedPlanId
            );

            // Check if plan name contains 'session' or 'per session' as fallback
            const isPerSession =
              selectedPlan?.billingType === 'PerSession' ||
              selectedPlan?.planName?.toLowerCase().includes('session');

            if (!selectedPlan || !isPerSession) {
              return (
                <KFormField
                  fieldType={KFormFieldType.SELECT}
                  control={form.control}
                  name="modeOfPayment"
                  label="Mode of Payment"
                  options={[
                    { label: 'Cash', value: '0' },
                    { label: 'UPI', value: '1' },
                  ]}
                />
              );
            }
            return null;
          })()}

          <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Date of joining */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.DATE_PICKER}
                control={form.control}
                name="doj"
                label="Date of joining"
                mode="single"
                floating
              />
            </div>

            {/* Date of birth */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.DATE_INPUT}
                control={form.control}
                name="dob"
                label="Date of birth"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
            {/* Personal Trainer */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="personalTrainer"
                label="Personal Trainer"
                options={
                  formOptions?.trainers
                    ? formOptions.trainers.map((option) => ({
                        label: option.trainerName,
                        value: String(option.id),
                      }))
                    : []
                }
              />
            </div>

            {/* Blood Group */}
            <div className="w-full sm:w-1/2 ">
              <KFormField
                fieldType={KFormFieldType.SELECT}
                control={form.control}
                name="bloodGroup"
                label="Blood Group"
                options={bloodGroupOptions}
              />
            </div>
          </div>

          {/* Workout Plan */}
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="workoutPlanId"
            label="Workout Plan"
            options={formOptions?.workoutPlans.map((option) => ({
              label: option.name,
              value: String(option.id),
            }))}
          />

          {/* Address Details */}
          <h5 className="text-white text-base font-normal leading-normal mt-8!">
            Address Details
          </h5>
          <KFormField
            fieldType={KFormFieldType.TEXTAREA}
            control={form.control}
            name="address"
            label="Address Line"
          />
        </form>
      </FormProvider>
    </KSheet>
  );
};

export default AddMember;
