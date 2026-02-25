import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { ArrowRightLeft, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import { FieldColumn, FieldRow } from '@/components/shared/form/field-layout';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KInput } from '@/components/shared/form/k-input';
import { KSheet } from '@/components/shared/form/k-sheet';
import { InfoBanner } from '@/components/shared/info-banner';
import { Spinner } from '@/components/shared/loader';
import FileUploader from '@/components/shared/uploaders/file-uploader';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGymFormOptions } from '@/hooks/use-gymform-options';
import { useMemberForm } from '@/hooks/use-member-form';
import {
  bloodGroupOptions,
  feeStatusOptions,
  genderOptions,
  idTypeOptions,
  memberOnboardingTypeOptions,
  paymentModeOptions,
  purposeOptions,
  relationOptions,
} from '@/lib/constants';
import {
  calculateSessionTotal,
  validatePaymentAmount,
} from '@/lib/utils/payment-validation';
import { createMemberSchema } from '@/schemas/index';

type CreateMemberDetailsData = z.infer<typeof createMemberSchema>;
type OnboardingTypeValue = NonNullable<
  CreateMemberDetailsData['onboardingType']
>;

type MembershipPlanSubset = {
  membershipPlanId: number;
  planName: string;
  fee: number;
  durationInDays?: number;
  billingType?: 'Recurring' | 'PerSession';
};

const isPerSessionPlan = (plan: MembershipPlanSubset): boolean =>
  plan.billingType === 'PerSession';

const PaymentWarnings = ({
  showPaidWarning,
  showUnpaidWarning,
  showOverpaymentError,
  excessAmount,
}: {
  showPaidWarning: boolean;
  showUnpaidWarning: boolean;
  showOverpaymentError: boolean;
  excessAmount: string;
}) => (
  <>
    {showPaidWarning && (
      <InfoBanner
        variant="warning"
        icon="⚠️"
        message='Amount is less than total. Consider changing status to "Partial"'
      />
    )}
    {showUnpaidWarning && (
      <InfoBanner
        variant="warning"
        icon="⚠️"
        message='Amount entered but status is "Unpaid". Consider changing to "Paid" or "Partial"'
      />
    )}
    {showOverpaymentError && (
      <InfoBanner
        variant="error"
        icon="🚫"
        message={`Amount exceeds total by ₹${excessAmount}. Please verify the amount.`}
      />
    )}
  </>
);

const PaymentFields = ({
  form,
  totalAmount,
  paymentSectionRef,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  totalAmount: number;
  paymentSectionRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const amountPaid = form.watch('amountPaid');
  const feeStatus = form.watch('feeStatus') || '';

  const { showPaidWarning, showUnpaidWarning, showOverpaymentError } =
    validatePaymentAmount(amountPaid, feeStatus, totalAmount);

  const paidAmount = amountPaid ? Number(amountPaid) : 0;
  const excessAmount = Math.max(
    0,
    Number((paidAmount - totalAmount).toFixed(2))
  );

  return (
    <div
      ref={paymentSectionRef}
      className="space-y-4 p-4 bg-secondary-blue-600/50 rounded-lg border border-secondary-blue-400"
    >
      <FieldRow>
        <FieldColumn auto={feeStatus === 'unpaid'}>
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="feeStatus"
            label="Fee Status"
            options={feeStatusOptions}
          />
        </FieldColumn>
        {feeStatus !== 'unpaid' && (
          <FieldColumn>
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="amountPaid"
              label="Amount Paid"
              type="number"
              maxLength={10}
              suffix={
                totalAmount > 0
                  ? `/ ${totalAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`
                  : ''
              }
            />
          </FieldColumn>
        )}
      </FieldRow>

      <PaymentWarnings
        showPaidWarning={showPaidWarning}
        showUnpaidWarning={showUnpaidWarning}
        showOverpaymentError={showOverpaymentError}
        excessAmount={excessAmount.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}
      />
      {feeStatus !== 'unpaid' && (
        <KFormField
          fieldType={KFormFieldType.SELECT}
          control={form.control}
          name="modeOfPayment"
          label="Mode of Payment"
          options={paymentModeOptions}
        />
      )}
    </div>
  );
};

const PerSessionPayment = ({
  form,
  selectedPlan,
  paymentSectionRef,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  selectedPlan: MembershipPlanSubset;
  paymentSectionRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const customRate = form.watch('customSessionRate');
  const numberOfSessions = form.watch('numberOfSessions');

  const totalAmount = calculateSessionTotal(
    numberOfSessions,
    customRate,
    selectedPlan.fee
  );

  return (
    <div
      ref={paymentSectionRef}
      className="space-y-4 p-4 bg-secondary-blue-600/50 rounded-lg border border-secondary-blue-400"
    >
      <div>
        <KFormField
          fieldType={KFormFieldType.INPUT}
          control={form.control}
          name="customSessionRate"
          label="Custom Session Rate (Optional)"
          placeholder={`Default: ₹${selectedPlan.fee}`}
          type="number"
        />
        <InfoBanner
          variant="info"
          icon="💡"
          title="Per Session Billing:"
          message={`Leave empty to use plan's default rate of ₹${selectedPlan.fee} per session`}
        />
      </div>
      <KFormField
        fieldType={KFormFieldType.INPUT}
        control={form.control}
        name="numberOfSessions"
        label="Number of Sessions"
        placeholder="Enter sessions"
        type="number"
      />
      <PaymentFields
        form={form}
        totalAmount={totalAmount}
        paymentSectionRef={paymentSectionRef}
      />
    </div>
  );
};

const RecurringPayment = ({
  form,
  totalAmount,
  paymentSectionRef,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  totalAmount: number;
  paymentSectionRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return (
    <PaymentFields
      form={form}
      totalAmount={totalAmount}
      paymentSectionRef={paymentSectionRef}
    />
  );
};

const PaymentSection = ({
  form,
  selectedPlan,
  recurringTotalAmount,
  paymentSectionRef,
}: {
  form: UseFormReturn<CreateMemberDetailsData>;
  selectedPlan: MembershipPlanSubset;
  recurringTotalAmount?: number;
  paymentSectionRef: React.RefObject<HTMLDivElement | null>;
}) => {
  return isPerSessionPlan(selectedPlan) ? (
    <PerSessionPayment
      form={form}
      selectedPlan={selectedPlan}
      paymentSectionRef={paymentSectionRef}
    />
  ) : (
    <RecurringPayment
      form={form}
      totalAmount={recurringTotalAmount ?? selectedPlan.fee}
      paymentSectionRef={paymentSectionRef}
    />
  );
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const getStartOfDay = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const calculateMigratedRecurringTotal = ({
  fee,
  durationInDays,
  startDate,
}: {
  fee: number;
  durationInDays?: number;
  startDate?: string;
}): { cycles: number; total: number } => {
  const planDuration = Math.max(1, durationInDays || 30);
  if (!startDate) {
    return { cycles: 1, total: fee };
  }

  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) {
    return { cycles: 1, total: fee };
  }

  const today = getStartOfDay(new Date());
  const startDay = getStartOfDay(start);
  const diffMs = Math.max(0, today.getTime() - startDay.getTime());
  const elapsedDays = Math.floor(diffMs / DAY_IN_MS);
  const cycles = Math.floor(elapsedDays / planDuration) + 1;

  return { cycles, total: fee * cycles };
};

const onboardingTypeCardMeta: Record<
  OnboardingTypeValue,
  {
    description: string;
    helperText: string;
    icon: React.ReactNode;
  }
> = {
  fresh_join: {
    description: 'New member joining today.',
    helperText: 'Uses your current Add Member flow.',
    icon: <UserPlus className="h-6 w-6" />,
  },
  migrated_member: {
    description: 'Member joined before using KurlClub.',
    helperText: 'Lets you set current package start date for auto total.',
    icon: <ArrowRightLeft className="h-6 w-6" />,
  },
};

const OnboardingTypeCards = ({
  value,
  onSelect,
  errorMessage,
}: {
  value?: OnboardingTypeValue;
  onSelect: (value: OnboardingTypeValue) => void;
  errorMessage?: string;
}) => {
  return (
    <div className="space-y-3">
      <h5 className="text-white text-base font-normal leading-normal mt-0!">
        Member Onboarding Type
      </h5>
      <p className="text-gray-400 text-sm">
        Choose one to continue. The form will load based on your selection.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {memberOnboardingTypeOptions.map((option) => {
          const onboardingValue = option.value as OnboardingTypeValue;
          const meta = onboardingTypeCardMeta[onboardingValue];
          const isSelected = value === onboardingValue;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(onboardingValue)}
              className={`text-left rounded-xl border p-4 transition-all ${
                isSelected
                  ? 'border-primary-blue-400 bg-secondary-blue-500/80'
                  : 'border-secondary-blue-300 bg-secondary-blue-600/40 hover:border-secondary-blue-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white text-base">{option.label}</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {meta.description}
                  </p>
                </div>
                <div
                  className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-primary-blue-500/20 text-primary-blue-300'
                      : 'bg-secondary-blue-500/50 text-gray-300'
                  }`}
                >
                  {meta.icon}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">{meta.helperText}</p>
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <p className="text-alert-red-400 text-sm before:content-['*'] before:mr-px">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

const EditableGymId = ({
  isEditing,
  gymIdValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
}: {
  isEditing: boolean;
  gymIdValue: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={gymIdValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Gym No"
          className="h-[30px] w-32"
          autoFocus
        />
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={!gymIdValue.trim()}
          className="h-[30px] px-2 text-xs"
        >
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onCancel}
          className="h-[30px] px-2 text-xs"
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Badge
      onClick={onEdit}
      className="bg-secondary-blue-400 flex items-center w-fit justify-center text-sm text-white rounded-full h-[30px] py-2 px-2 border border-secondary-blue-300 bg-opacity-100 cursor-pointer hover:bg-secondary-blue-500 transition-colors"
    >
      Gym no: #{gymIdValue || 'Pending'}
    </Badge>
  );
};

// MAIN COMPONENT
type CreateMemberDetailsProps = {
  onSubmit?: (data: CreateMemberDetailsData) => void;
  closeSheet: () => void;
  isOpen: boolean;
  gymId?: number;
  onboardingId?: number;
  memberForm?: ReturnType<typeof useMemberForm>;
};

export const AddMember: React.FC<CreateMemberDetailsProps> = ({
  isOpen,
  closeSheet,
  gymId,
  onboardingId,
  memberForm: externalMemberForm,
}) => {
  const paymentSectionRef = React.useRef<HTMLDivElement>(null);
  const { formOptions } = useGymFormOptions(gymId);
  const internalMemberForm = useMemberForm(gymId, onboardingId);
  const {
    form,
    handleSubmit,
    existingPhotoUrl,
    existingIdCopyUrl,
    setExistingPhotoUrl,
    setExistingIdCopyUrl,
    isLoadingOnboarding,
  } = externalMemberForm || internalMemberForm;
  const isSubmitting = form.formState.isSubmitting;

  const [isEditingGymId, setIsEditingGymId] = React.useState(false);
  const [gymIdValue, setGymIdValue] = React.useState('');

  const onboardingType = form.watch('onboardingType');
  const hasSelectedOnboardingType = Boolean(onboardingType);
  const isMigratedMember = onboardingType === 'migrated_member';
  const selectedPlanId = form.watch('membershipPlanId');
  const currentPackageStartDate = form.watch('currentPackageStartDate');
  const onboardingTypeError =
    form.formState.errors.onboardingType?.message?.toString();
  const selectedPlan = formOptions?.membershipPlans.find(
    (plan) => String(plan.membershipPlanId) === selectedPlanId
  );

  const migratedRecurringCalculation = React.useMemo(() => {
    if (
      !isMigratedMember ||
      !selectedPlan ||
      isPerSessionPlan(selectedPlan) ||
      !currentPackageStartDate
    ) {
      return null;
    }

    return calculateMigratedRecurringTotal({
      fee: selectedPlan.fee,
      durationInDays: selectedPlan.durationInDays,
      startDate: currentPackageStartDate,
    });
  }, [currentPackageStartDate, isMigratedMember, selectedPlan]);

  const handleOnboardingTypeSelect = (value: OnboardingTypeValue) => {
    form.setValue('onboardingType', value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value === 'fresh_join') {
      form.setValue('currentPackageStartDate', '');
    }
  };

  const handleChangeOnboardingType = () => {
    form.setValue('onboardingType', undefined, {
      shouldDirty: true,
      shouldValidate: false,
    });
    form.clearErrors('onboardingType');
  };

  const handleSaveGymId = async () => {
    if (!gymIdValue.trim()) {
      toast.error('Gym No is required');
      return;
    }

    setIsEditingGymId(false);
  };

  const onSubmit = async (data: CreateMemberDetailsData) => {
    if (!data.onboardingType) {
      form.setError('onboardingType', {
        type: 'required',
        message: 'Member onboarding type is required',
      });
      return;
    }

    if (selectedPlan) {
      const totalFee = isPerSessionPlan(selectedPlan)
        ? calculateSessionTotal(
            data.numberOfSessions,
            data.customSessionRate,
            selectedPlan.fee
          )
        : migratedRecurringCalculation?.total || selectedPlan.fee;

      const { hasAnyWarning } = validatePaymentAmount(
        data.amountPaid,
        data.feeStatus || '',
        totalFee
      );

      if (hasAnyWarning) {
        paymentSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        return;
      }
    }

    const success = await handleSubmit(
      data,
      gymIdValue.trim() ? gymIdValue : undefined
    );
    if (success) {
      closeSheet();
      form.reset();
      setGymIdValue('');
    }
  };

  const footer = (
    <div className="flex justify-between items-center w-full gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="h-[46px] min-w-[90px]"
        onClick={() => {
          form.reset();
          form.clearErrors();
          setExistingPhotoUrl?.(null);
          setExistingIdCopyUrl?.(null);
        }}
        disabled={isSubmitting}
      >
        Reset
      </Button>
      <div className="flex justify-center gap-3">
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
          disabled={isSubmitting || !hasSelectedOnboardingType}
        >
          {isSubmitting ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-[536px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title="Add Member"
      footer={footer}
      onCloseBtnClick={() => {
        form.reset();
        form.clearErrors();
        closeSheet();
      }}
    >
      {isLoadingOnboarding ? (
        <Spinner message="Loading member details..." />
      ) : (
        <FormProvider {...form}>
          <form
            id="add-member-form"
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              const firstError = Object.keys(
                errors
              )[0] as keyof CreateMemberDetailsData;
              form.setFocus(firstError);
            })}
          >
            {!hasSelectedOnboardingType ? (
              <OnboardingTypeCards
                value={onboardingType}
                onSelect={handleOnboardingTypeSelect}
                errorMessage={onboardingTypeError}
              />
            ) : (
              <>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleChangeOnboardingType}
                    className="h-auto p-0 text-primary-blue-300 hover:text-primary-blue-200"
                  >
                    Change onboarding type
                  </Button>
                </div>
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
                  <EditableGymId
                    isEditing={isEditingGymId}
                    gymIdValue={gymIdValue}
                    onEdit={() => setIsEditingGymId(true)}
                    onSave={handleSaveGymId}
                    onCancel={() => setIsEditingGymId(false)}
                    onChange={setGymIdValue}
                  />
                </div>

                <h5 className="text-white text-base font-normal leading-normal mt-0!">
                  Basic Details
                </h5>

                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="memberName"
                  label="Member Name"
                  maxLength={20}
                />
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="email"
                  label="Email (Optional)"
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
                      label="Height (CM)"
                      maxLength={3}
                    />
                  </FieldColumn>
                  <FieldColumn>
                    <KFormField
                      fieldType={KFormFieldType.INPUT}
                      control={form.control}
                      name="weight"
                      label="Weight (KG)"
                      maxLength={3}
                    />
                  </FieldColumn>
                </FieldRow>

                <FieldRow>
                  <FieldColumn>
                    {isMigratedMember ? (
                      <KFormField
                        fieldType={KFormFieldType.UI_DATE_PICKER}
                        control={form.control}
                        name="doj"
                        label="Date of joining"
                        mode="single"
                        floating
                      />
                    ) : (
                      <KFormField
                        fieldType={KFormFieldType.SKELETON}
                        control={form.control}
                        name="doj"
                        renderSkeleton={(field) => (
                          <FormControl>
                            <KInput
                              label="Date of joining"
                              id="doj"
                              value={
                                typeof field.value === 'string'
                                  ? new Date(field.value).toLocaleDateString(
                                      'en-GB'
                                    )
                                  : ''
                              }
                              disabled
                              onChange={() => {}}
                            />
                          </FormControl>
                        )}
                      />
                    )}
                  </FieldColumn>
                  <FieldColumn>
                    <KFormField
                      fieldType={KFormFieldType.DATE_INPUT}
                      control={form.control}
                      name="dob"
                      label="Date of birth (DD/MM/YYYY)"
                    />
                  </FieldColumn>
                </FieldRow>

                {form.watch('onboardingType') === 'migrated_member' && (
                  <KFormField
                    fieldType={KFormFieldType.UI_DATE_PICKER}
                    control={form.control}
                    name="currentPackageStartDate"
                    label="Current Package Start Date"
                    mode="single"
                    floating
                    disabledDates={(date) => {
                      const doj = form.watch('doj');
                      if (!doj) return false;
                      const dojDate = new Date(doj);
                      dojDate.setHours(0, 0, 0, 0);
                      return date < dojDate;
                    }}
                  />
                )}

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

                {isMigratedMember && selectedPlan && (
                  <>
                    <KFormField
                      fieldType={KFormFieldType.UI_DATE_PICKER}
                      control={form.control}
                      name="currentPackageStartDate"
                      label="Current Package Start Date"
                      mode="single"
                      floating
                      disabledDates={(date) => {
                        const doj = form.watch('doj');
                        if (!doj) return false;
                        const dojDate = new Date(doj);
                        dojDate.setHours(0, 0, 0, 0);
                        return date < dojDate;
                      }}
                    />
                    <InfoBanner
                      variant="info"
                      icon="ℹ️"
                      message={
                        migratedRecurringCalculation
                          ? `Auto total till today: ₹${migratedRecurringCalculation.total.toLocaleString()} (${migratedRecurringCalculation.cycles} cycle${migratedRecurringCalculation.cycles > 1 ? 's' : ''})`
                          : 'Select current package start date to auto-calculate total amount.'
                      }
                    />
                  </>
                )}

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

                {selectedPlan && (
                  <PaymentSection
                    form={form}
                    selectedPlan={selectedPlan}
                    recurringTotalAmount={migratedRecurringCalculation?.total}
                    paymentSectionRef={paymentSectionRef}
                  />
                )}

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
                  maxLength={250}
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
                  Emergency Details
                </h5>
                <p className="text-gray-400 text-sm -mt-2 mb-2">
                  Who should we contact in case of emergency?
                </p>
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="emergencyContactName"
                  label="Emergency Contact Name"
                  maxLength={20}
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
                  maxLength={250}
                />
              </>
            )}
          </form>
        </FormProvider>
      )}
    </KSheet>
  );
};

export default AddMember;
