import Image from 'next/image';
import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { z } from 'zod/v4';

import { FieldColumn, FieldRow } from '@/components/shared/form/field-layout';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { OptionalSection } from '@/components/shared/form/optional-section';
import { InfoBanner } from '@/components/shared/info-banner';
import { Spinner } from '@/components/shared/loader';
import FileUploader from '@/components/shared/uploaders/file-uploader';
import ProfilePictureUploader from '@/components/shared/uploaders/profile-uploader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormLabel } from '@/components/ui/form';
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
  showPartialWarning,
  showOverpaymentError,
  showDiscountError,
  effectiveTotal,
  paidAmount,
}: {
  showPaidWarning: boolean;
  showPartialWarning: boolean;
  showOverpaymentError: boolean;
  showDiscountError: boolean;
  effectiveTotal: number;
  paidAmount: number;
}) => (
  <>
    {showDiscountError && (
      <InfoBanner
        variant="error"
        icon="🚫"
        message="Discount must be less than package amount"
      />
    )}
    {showPaidWarning && (
      <InfoBanner
        variant="warning"
        icon="⚠️"
        message={`Status is "Paid" but amount (₹${paidAmount.toLocaleString()}) doesn't match effective total (₹${effectiveTotal.toLocaleString()}). Change status to "Partial" or adjust amount.`}
      />
    )}
    {showPartialWarning && (
      <InfoBanner
        variant="warning"
        icon="⚠️"
        message={`Status is "Partial" but amount is ${paidAmount === 0 ? 'zero' : 'equal to effective total'}. Change to "${paidAmount === 0 ? 'Unpaid' : 'Paid'}".`}
      />
    )}
    {showOverpaymentError && (
      <InfoBanner
        variant="error"
        icon="🚫"
        message={`Amount (₹${paidAmount.toLocaleString()}) exceeds effective total (₹${effectiveTotal.toLocaleString()}) by ₹${(paidAmount - effectiveTotal).toLocaleString()}`}
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
  const isDiscounted = form.watch('isDiscounted');
  const discountedAmount = form.watch('discountedAmount');

  const {
    showPaidWarning,
    showPartialWarning,
    showOverpaymentError,
    showDiscountError,
  } = validatePaymentAmount(
    amountPaid,
    feeStatus,
    totalAmount,
    discountedAmount
  );

  const paidAmount = amountPaid ? Number(amountPaid) : 0;
  const discount = discountedAmount ? Number(discountedAmount) : 0;
  const effectiveTotal = Math.max(0, totalAmount - discount);

  return (
    <div
      id="payment-validation-section"
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
                effectiveTotal > 0
                  ? `/ ${effectiveTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}`
                  : ''
              }
            />
          </FieldColumn>
        )}
      </FieldRow>

      {/* Discount Section - Show for ALL statuses */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDiscounted"
          checked={isDiscounted}
          onCheckedChange={(checked) => {
            form.setValue('isDiscounted', checked as boolean);
            if (!checked) {
              form.setValue('discountedAmount', '');
            }
          }}
        />
        <FormLabel
          htmlFor="isDiscounted"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Apply Discount
        </FormLabel>
      </div>

      {isDiscounted && (
        <KFormField
          fieldType={KFormFieldType.INPUT}
          control={form.control}
          name="discountedAmount"
          label="Discount Amount"
          type="number"
          placeholder="Enter discount amount"
          maxLength={10}
          suffix={`Max: ${totalAmount.toLocaleString()}`}
        />
      )}

      {/* Breakdown Display */}
      {isDiscounted && discount > 0 && (
        <div className="text-sm space-y-2 p-4 bg-secondary-blue-500/30 rounded-lg border border-secondary-blue-400">
          <div className="flex justify-between">
            <span className="text-gray-400">Package Amount:</span>
            <span className="text-white">₹{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Discount Applied:</span>
            <span className="text-alert-red-400">
              -₹{discount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-t border-secondary-blue-400 pt-2">
            <span className="text-white font-semibold">Effective Total:</span>
            <span className="text-primary-green-500 font-semibold">
              ₹{effectiveTotal.toLocaleString()}
            </span>
          </div>

          {feeStatus !== 'unpaid' && paidAmount > 0 && (
            <>
              <div className="flex justify-between text-gray-300">
                <span>Amount Paid:</span>
                <span>₹{paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-secondary-blue-400 pt-2">
                <span className="text-white font-semibold">Pending:</span>
                <span
                  className={`font-semibold ${
                    effectiveTotal - paidAmount === 0
                      ? 'text-primary-green-500'
                      : 'text-alert-orange-400'
                  }`}
                >
                  ₹{Math.max(0, effectiveTotal - paidAmount).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      <PaymentWarnings
        showPaidWarning={showPaidWarning}
        showPartialWarning={showPartialWarning}
        showOverpaymentError={showOverpaymentError}
        showDiscountError={showDiscountError}
        effectiveTotal={effectiveTotal}
        paidAmount={paidAmount}
      />
      {feeStatus !== 'unpaid' && (
        <>
          <KFormField
            fieldType={KFormFieldType.INPUT}
            control={form.control}
            name="joiningFee"
            label="Joining Fee (Optional)"
            type="number"
            maxLength={10}
          />
          <KFormField
            fieldType={KFormFieldType.SELECT}
            control={form.control}
            name="modeOfPayment"
            label="Mode of Payment"
            options={paymentModeOptions}
          />
        </>
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
    title: string;
    description: string;
    characterImage: string;
  }
> = {
  fresh_join: {
    title: 'Add new member',
    description: 'Add a completely new member',
    characterImage: '/images/new-member.png',
  },
  migrated_member: {
    title: 'Migrate member',
    description: 'Add an already existing member.',
    characterImage: '/images/migrate-member.png',
  },
};

const selectedOnboardingTypeMeta: Record<
  OnboardingTypeValue,
  {
    title: string;
  }
> = {
  fresh_join: {
    title: 'New Member',
  },
  migrated_member: {
    title: 'Migrated Member',
  },
};

const MemberSheetTitle = ({
  onboardingType,
  onChange,
}: {
  onboardingType?: OnboardingTypeValue;
  onChange: () => void;
}) => {
  const title = onboardingType
    ? `Add ${selectedOnboardingTypeMeta[onboardingType].title}`
    : 'Choose Member Type';

  return (
    <div className="flex items-center gap-3 pr-10">
      <span className="min-w-0 truncate">{title}</span>
      {onboardingType && (
        <Button
          type="button"
          variant="outlinePrimary"
          size="sm"
          onClick={onChange}
        >
          Change
        </Button>
      )}
    </div>
  );
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
  const orderedOptions: OnboardingTypeValue[] = [
    'fresh_join',
    'migrated_member',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {orderedOptions.map((optionValue) => {
          const meta = onboardingTypeCardMeta[optionValue];
          const isSelected = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              onClick={() => onSelect(optionValue)}
              className={`relative text-left rounded-[14px] border transition-all overflow-hidden min-h-27.5 ${
                isSelected
                  ? 'border-primary-green-500'
                  : 'border-secondary-blue-400 hover:border-secondary-blue-300'
              }`}
            >
              <div
                className="absolute inset-0 bg-linear-to-br from-[#141720] via-[#1C1F24] to-[#282D35]"
                style={{ zIndex: 0 }}
              />
              <div className="relative p-4" style={{ zIndex: 1 }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-white text-lg font-medium">
                      {meta.title}
                    </p>
                    <p className="text-gray-300 text-xs font-light mt-1">
                      {meta.description}
                    </p>
                    <p className="text-primary-green-500 text-sm mt-3 underline">
                      Add +
                    </p>
                  </div>
                </div>
              </div>
              <div
                className="absolute bottom-0 -right-2.5"
                style={{ zIndex: 2 }}
              >
                <Image
                  src={meta.characterImage}
                  alt={meta.title}
                  width={160}
                  height={150}
                  className="object-contain pointer-events-none"
                  priority
                />
              </div>
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

// const EditableGymId = ({
//   isEditing,
//   gymIdValue,
//   onEdit,
//   onSave,
//   onCancel,
//   onChange,
// }: {
//   isEditing: boolean;
//   gymIdValue: string;
//   onEdit: () => void;
//   onSave: () => void;
//   onCancel: () => void;
//   onChange: (value: string) => void;
// }) => {
//   if (isEditing) {
//     return (
//       <div className="flex items-center gap-2">
//         <Input
//           type="text"
//           value={gymIdValue}
//           onChange={(e) => onChange(e.target.value)}
//           placeholder="Enter Gym No"
//           className="h-[30px] w-32"
//           autoFocus
//         />
//         <Button
//           type="button"
//           size="sm"
//           onClick={onSave}
//           disabled={!gymIdValue.trim()}
//           className="h-[30px] px-2 text-xs"
//         >
//           Save
//         </Button>
//         <Button
//           type="button"
//           size="sm"
//           variant="secondary"
//           onClick={onCancel}
//           className="h-[30px] px-2 text-xs"
//         >
//           Cancel
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <Badge
//       onClick={onEdit}
//       className="bg-secondary-blue-400 flex items-center w-fit justify-center text-sm text-white rounded-full h-[30px] py-2 px-2 border border-secondary-blue-300 bg-opacity-100 cursor-pointer hover:bg-secondary-blue-500 transition-colors"
//     >
//       Gym no: #{gymIdValue || 'Pending'}
//     </Badge>
//   );
// };

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

  // const [isEditingGymId, setIsEditingGymId] = React.useState(false);?
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

  // const handleSaveGymId = async () => {
  //   if (!gymIdValue.trim()) {
  //     toast.error('Gym No is required');
  //     return;
  //   }

  //   setIsEditingGymId(false);
  // };

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
        totalFee,
        data.discountedAmount
      );

      if (hasAnyWarning) {
        document.getElementById('payment-validation-section')?.scrollIntoView({
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
        className="h-11.5 min-w-22.5"
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
          className="h-11.5 min-w-22.5"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-member-form"
          className="h-11.5 min-w-18.25"
          disabled={isSubmitting || !hasSelectedOnboardingType}
        >
          {isSubmitting ? 'Saving...' : 'Add'}
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-124"
      isOpen={isOpen}
      onClose={closeSheet}
      title={
        <MemberSheetTitle
          onboardingType={onboardingType}
          onChange={handleChangeOnboardingType}
        />
      }
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
                  {/* TODO:Custom gymID feature */}
                  {/* <EditableGymId
                    isEditing={isEditingGymId}
                    gymIdValue={gymIdValue}
                    onEdit={() => setIsEditingGymId(true)}
                    onSave={handleSaveGymId}
                    onCancel={() => setIsEditingGymId(false)}
                    onChange={setGymIdValue}
                  /> */}
                  <Badge className="bg-secondary-blue-400 flex items-center w-fit justify-center text-sm text-white rounded-full h-7.5 py-2 px-2 border border-secondary-blue-300 bg-opacity-100 transition-colors">
                    Gym no: #Pending
                  </Badge>
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
                  fieldType={KFormFieldType.PHONE_INPUT}
                  control={form.control}
                  name="phone"
                  label="Phone"
                  placeholder="(555) 123-4567"
                />
                <KFormField
                  fieldType={KFormFieldType.UI_DATE_PICKER}
                  control={form.control}
                  name="doj"
                  label="Date of joining"
                  mode="single"
                  floating
                />

                <KFormField
                  fieldType={KFormFieldType.TEXTAREA}
                  control={form.control}
                  name="address"
                  label="Address Line"
                  maxLength={250}
                />

                <OptionalSection title="Additional Personal Details">
                  <KFormField
                    fieldType={KFormFieldType.INPUT}
                    control={form.control}
                    name="email"
                    label="Email"
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

                  <KFormField
                    fieldType={KFormFieldType.DATE_INPUT}
                    control={form.control}
                    name="dob"
                    label="Date of birth (DD/MM/YYYY)"
                  />
                </OptionalSection>

                <h5 className="text-white text-base font-normal leading-normal mt-8!">
                  Membership & Training
                </h5>

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

                {selectedPlan && (
                  <PaymentSection
                    form={form}
                    selectedPlan={selectedPlan}
                    recurringTotalAmount={migratedRecurringCalculation?.total}
                    paymentSectionRef={paymentSectionRef}
                  />
                )}

                <OptionalSection title="Trainer & Workout Plan">
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
                </OptionalSection>

                <OptionalSection title="Health, Identity & Emergency Contact">
                  <h6 className="text-white text-sm font-medium">
                    Health & Fitness Goals
                  </h6>
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

                  <h6 className="text-white text-sm font-medium mt-6">
                    Identity Verification
                  </h6>
                  <p className="text-gray-400 text-xs mb-3">
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

                  <h6 className="text-white text-sm font-medium mt-6">
                    Emergency Contact
                  </h6>
                  <p className="text-gray-400 text-xs mb-3">
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
                </OptionalSection>
              </>
            )}
          </form>
        </FormProvider>
      )}
    </KSheet>
  );
};

export default AddMember;
