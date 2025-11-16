import { FormProvider, UseFormReturn } from 'react-hook-form';

import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Spinner } from '@/components/shared/loader';
import FileUploader from '@/components/shared/uploaders/file-uploader';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useMemberForm } from '@/hooks/use-member-form';
import {
  bloodGroupOptions,
  feeStatusOptions,
  genderOptions,
  idTypeOptions,
  paymentModeOptions,
  purposeOptions,
  relationOptions,
} from '@/lib/constants';
import { createMemberSchema } from '@/schemas/index';

type CreateMemberDetailsData = z.infer<typeof createMemberSchema>;

type MembershipPlanSubset = {
  membershipPlanId: number;
  planName: string;
  fee: number;
  billingType?: 'Recurring' | 'PerSession';
};

const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
    {children}
  </div>
);

const FieldColumn = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full sm:w-1/2">{children}</div>
);

const PerSessionPayment = ({
  form,
  selectedPlan,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  selectedPlan: MembershipPlanSubset;
}) => {
  const customRate = form.watch('customSessionRate');
  const numberOfSessions = form.watch('numberOfSessions');
  const sessionRate = customRate ? Number(customRate) : selectedPlan.fee;
  const sessionsNum = numberOfSessions ? Number(numberOfSessions) : 0;
  const totalAmount = sessionsNum > 0 ? sessionRate * sessionsNum : 0;

  return (
    <div className="space-y-4 p-4 bg-secondary-blue-600/50 rounded-lg border border-secondary-blue-400">
      <div>
        <KFormField
          fieldType={KFormFieldType.INPUT}
          control={form.control}
          name="customSessionRate"
          label="Custom Session Rate (Optional)"
          placeholder={`Default: ₹${selectedPlan.fee}`}
          type="number"
        />
        <div className="mt-2 p-2 bg-primary-green-500/10 border border-primary-green-500/20 rounded-md">
          <p className="text-xs text-gray-300">
            💡 <strong>Per Session Billing:</strong> Leave empty to use
            plan&apos;s default rate of ₹{selectedPlan.fee} per session
          </p>
        </div>
      </div>
      <KFormField
        fieldType={KFormFieldType.INPUT}
        control={form.control}
        name="numberOfSessions"
        label="Number of Sessions"
        placeholder="Enter sessions"
        type="number"
      />
      <FieldRow>
        <FieldColumn>
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="feeStatus"
            label="Fee Status"
            options={feeStatusOptions}
          />
        </FieldColumn>
        <FieldColumn>
          <KFormField
            suffix={totalAmount > 0 ? `/ ${totalAmount.toLocaleString()}` : ''}
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="amountPaid"
            label="Amount Paid"
            type="number"
            maxLength={10}
          />
        </FieldColumn>
      </FieldRow>
      <KFormField
        fieldType={KFormFieldType.SELECT}
        control={form.control}
        name="modeOfPayment"
        label="Mode of Payment"
        options={paymentModeOptions}
      />
    </div>
  );
};

const RecurringPayment = ({
  form,
  selectedPlan,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  selectedPlan: MembershipPlanSubset;
}) => (
  <div className="space-y-4 p-4 bg-secondary-blue-600/50 rounded-lg border border-secondary-blue-400">
    <FieldRow>
      <FieldColumn>
        <KFormField
          fieldType={KFormFieldType.SELECT}
          control={form.control}
          name="feeStatus"
          label="Fee Status"
          options={feeStatusOptions}
        />
      </FieldColumn>
      <FieldColumn>
        <KFormField
          suffix={`/ ${selectedPlan.fee.toLocaleString()}`}
          fieldType={KFormFieldType.INPUT}
          control={form.control}
          name="amountPaid"
          label="Amount Paid"
          maxLength={10}
        />
      </FieldColumn>
    </FieldRow>
    <KFormField
      fieldType={KFormFieldType.SELECT}
      control={form.control}
      name="modeOfPayment"
      label="Mode of Payment"
      options={paymentModeOptions}
    />
  </div>
);

const PaymentSection = ({
  form,
  selectedPlan,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  selectedPlan: MembershipPlanSubset;
}) => {
  const isPerSession =
    selectedPlan.billingType === 'PerSession' ||
    selectedPlan.planName?.toLowerCase().includes('session');

  return isPerSession ? (
    <PerSessionPayment form={form} selectedPlan={selectedPlan} />
  ) : (
    <RecurringPayment form={form} selectedPlan={selectedPlan} />
  );
};

// MAIN COMPONENT
type CreateMemberDetailsProps = {
  onSubmit?: (data: CreateMemberDetailsData) => void;
  closeSheet: () => void;
  isOpen: boolean;
  gymId?: number;
  onboardingId?: number;
};

export const AddMember: React.FC<CreateMemberDetailsProps> = ({
  isOpen,
  closeSheet,
  gymId,
  onboardingId,
}) => {
  const { formOptions } = useGymFormOptions(gymId);
  const {
    form,
    handleSubmit,
    existingPhotoUrl,
    existingIdCopyUrl,
    setExistingPhotoUrl,
    setExistingIdCopyUrl,
    isLoadingOnboarding,
  } = useMemberForm(gymId, onboardingId, isOpen);
  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CreateMemberDetailsData) => {
    const success = await handleSubmit(data);
    if (success) {
      closeSheet();
      form.reset();
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
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="add-member-form"
        className="h-[46px] min-w-[73px]"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : 'Add'}
      </Button>
    </div>
  );

  return (
    <KSheet
      className="w-[536px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title="Add Member"
      footer={footer}
    >
      {isLoadingOnboarding ? (
        <Spinner message="Loading member details..." />
      ) : (
        <FormProvider {...form}>
          <form
            id="add-member-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="items-start gap-2 mb-6 flex justify-between">
              <KFormField
                fieldType={KFormFieldType.SKELETON}
                control={form.control}
                name="profilePicture"
                renderSkeleton={(field) => (
                  <FormControl>
                    <ProfilePictureUploader
                      files={field.value as File | null}
                      onChange={(file) => {
                        field.onChange(file);
                        if (!file) setExistingPhotoUrl(null);
                      }}
                      existingImageUrl={existingPhotoUrl}
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

            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="name"
              label="Member Name"
            />
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="email"
              label="Email"
            />
            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="phone"
              label="Phone"
              placeholder="(555) 123-4567"
            />

            <FieldRow>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.SELECT}
                  control={form.control}
                  name="gender"
                  label="Gender"
                  options={genderOptions}
                />
              </FieldColumn>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.SELECT}
                  control={form.control}
                  name="bloodGroup"
                  label="Blood Group"
                  options={bloodGroupOptions}
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="height"
                  label="Height (In Centimeters)"
                />
              </FieldColumn>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="weight"
                  label="Weight (In Kilograms)"
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.DATE_PICKER}
                  control={form.control}
                  name="doj"
                  label="Date of joining"
                  mode="single"
                  floating
                />
              </FieldColumn>
              <FieldColumn>
                <KFormField
                  fieldType={KFormFieldType.DATE_INPUT}
                  control={form.control}
                  name="dob"
                  label="Date of birth"
                />
              </FieldColumn>
            </FieldRow>

            <FieldRow>
              <FieldColumn>
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
              </FieldColumn>
              <FieldColumn>
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
              </FieldColumn>
            </FieldRow>

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

            {(() => {
              const selectedPlanId = form.watch('membershipPlanId');
              const selectedPlan = formOptions?.membershipPlans.find(
                (plan) => String(plan.membershipPlanId) === selectedPlanId
              );

              return selectedPlan ? (
                <PaymentSection form={form} selectedPlan={selectedPlan} />
              ) : null;
            })()}

            <h5 className="text-white text-base font-normal leading-normal mt-8!">
              Health & Fitness Goals
            </h5>
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="fitnessGoal"
              label="What brings you here?"
              options={purposeOptions}
            />
            <KFormField
              fieldType={KFormFieldType.TEXTAREA}
              control={form.control}
              name="medicalHistory"
              label="Medical History or Notes"
            />

            <h5 className="text-white text-base font-normal leading-normal mt-8!">
              Identity Verification
            </h5>
            <p className="text-gray-400 text-sm -mt-2 mb-2">
              Please provide a government-issued ID for verification
            </p>
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="idType"
              label="ID Type"
              options={idTypeOptions}
            />
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="idNumber"
              label="ID Number"
            />
            <KFormField
              fieldType={KFormFieldType.SKELETON}
              control={form.control}
              name="idCopyPath"
              renderSkeleton={(field) => (
                <FormControl>
                  <FileUploader
                    file={field.value as File | null}
                    onChange={(file) => {
                      field.onChange(file);
                      if (!file) setExistingIdCopyUrl(null);
                    }}
                    label="Upload ID Document"
                    existingFileUrl={existingIdCopyUrl}
                  />
                </FormControl>
              )}
            />

            <h5 className="text-white text-base font-normal leading-normal mt-8!">
              Emergency Contact
            </h5>
            <p className="text-gray-400 text-sm -mt-2 mb-2">
              Who should we contact in case of emergency?
            </p>
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="emergencyContactName"
              label="Emergency Contact Name"
            />
            <KFormField
              fieldType={KFormFieldType.PHONE_INPUT}
              control={form.control}
              name="emergencyContactPhone"
              label="Emergency Contact Phone"
              placeholder="(555) 123-4567"
            />
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="emergencyContactRelation"
              label="Relation"
              options={relationOptions}
            />

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
      )}
    </KSheet>
  );
};

export default AddMember;
