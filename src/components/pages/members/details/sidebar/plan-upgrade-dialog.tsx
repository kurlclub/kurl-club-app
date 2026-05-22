'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useQueryClient } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { paymentMethodOptions } from '@/lib/constants';
import { toUtcDateOnlyISOString } from '@/lib/utils';
import { upgradeMemberPlan } from '@/services/member';
import type { MemberDetails } from '@/types/member.types';

type UpgradeStep = 'form' | 'outstanding-warning' | 'active-plan-warning';

type UpgradePlanFormValues = {
  targetPlanId: string;
  effectiveDate: string;
  amountPaid: string;
  paymentMethod: string;
};

type PlanUpgradeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  member: MemberDetails | null;
  onUpgradeSuccess: () => void;
  plans: FormOptionsResponse['membershipPlans'];
};

const getAmountText = (amount: number) =>
  `Rs. ${new Intl.NumberFormat('en-IN').format(amount)}`;

export function PlanUpgradeDialog({
  open,
  onOpenChange,
  memberId,
  member,
  onUpgradeSuccess,
  plans,
}: PlanUpgradeDialogProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<UpgradeStep>('form');
  const [pendingValues, setPendingValues] =
    useState<UpgradePlanFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<UpgradePlanFormValues>({
    defaultValues: {
      targetPlanId: '',
      effectiveDate: toUtcDateOnlyISOString(new Date()),
      amountPaid: '',
      paymentMethod: '',
    },
  });

  const availablePlans = useMemo(
    () =>
      plans.filter(
        (plan) => plan.membershipPlanId !== member?.membershipPlanId
      ),
    [member?.membershipPlanId, plans]
  );

  const outstandingAmount = member?.paymentCycleInfo?.pendingAmount ?? 0;
  const daysLeft = Math.max(member?.daysRemaining ?? 0, 0);

  const resetDialog = () => {
    setStep('form');
    setPendingValues(null);
    form.reset({
      targetPlanId: '',
      effectiveDate: toUtcDateOnlyISOString(new Date()),
      amountPaid: '',
      paymentMethod: '',
    });
    setIsSubmitting(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
    if (!nextOpen) resetDialog();
  };

  const handleUpgrade = async (values: UpgradePlanFormValues) => {
    if (!member || !values.targetPlanId) {
      toast.error('Please select a target plan.');
      return;
    }

    if (!values.effectiveDate) {
      toast.error('Please select an effective date.');
      return;
    }

    if (Number(values.amountPaid) < 0) {
      toast.error('Amount paid cannot be negative.');
      return;
    }

    setPendingValues(values);

    if (outstandingAmount > 0) {
      setStep('outstanding-warning');
      return;
    }

    if (daysLeft > 0) {
      setStep('active-plan-warning');
      return;
    }

    await submitUpgrade(values);
  };

  const submitUpgrade = async (
    values: UpgradePlanFormValues | null = pendingValues
  ) => {
    if (!member || !values?.targetPlanId) return;

    setIsSubmitting(true);
    try {
      const response = await upgradeMemberPlan(memberId || member.memberId, {
        newMembershipPlanId: Number(values.targetPlanId),
        effectiveFrom: toUtcDateOnlyISOString(values.effectiveDate),
        amountPaid: Number(values.amountPaid) || 0,
        paymentMethod: values.paymentMethod,
        numberOfSessions: 0,
        perSessionRate: 0,
      });

      toast.success(response.message || 'Plan upgraded successfully');
      await queryClient.refetchQueries({
        queryKey: ['member', memberId || member.memberId],
        exact: true,
      });
      await queryClient.invalidateQueries({ queryKey: ['gymMembers'] });
      await queryClient.invalidateQueries({ queryKey: ['allGymMembers'] });
      onUpgradeSuccess();
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to upgrade plan';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const continueFromOutstanding = () => {
    if (daysLeft > 0) {
      setStep('active-plan-warning');
      return;
    }

    void submitUpgrade();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-primary-blue-500 border-secondary-blue-500 text-white sm:max-w-[520px]">
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle>Upgrade Plan</DialogTitle>
              <DialogDescription>
                Choose the new plan and payment details for this member.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <div className="grid gap-4">
                <KFormField
                  control={form.control}
                  fieldType={KFormFieldType.SELECT}
                  name="targetPlanId"
                  label="Target plan"
                  options={availablePlans.map((plan) => ({
                    label: plan.planName,
                    value: String(plan.membershipPlanId),
                  }))}
                  className="bg-secondary-blue-500 border-primary-blue-300 text-white"
                  enableSearch
                />

                <KFormField
                  control={form.control}
                  fieldType={KFormFieldType.DATE_PICKER}
                  name="effectiveDate"
                  label="Effective date"
                  mode="single"
                  floating
                  showPresets={false}
                  iconSrc={<Calendar />}
                  className="bg-secondary-blue-500 border-primary-blue-300 text-white w-full justify-between"
                />

                <KFormField
                  control={form.control}
                  fieldType={KFormFieldType.INPUT}
                  name="amountPaid"
                  label="Amount paid"
                  type="number"
                  className="bg-secondary-blue-500 border-primary-blue-300 text-white"
                />

                <KFormField
                  control={form.control}
                  fieldType={KFormFieldType.SELECT}
                  name="paymentMethod"
                  label="Payment method"
                  options={paymentMethodOptions}
                  className="bg-secondary-blue-500 border-primary-blue-300 text-white"
                />
              </div>
            </Form>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleUpgrade)}
                disabled={isSubmitting}
              >
                Upgrade
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'outstanding-warning' && (
          <>
            <DialogHeader>
              <DialogTitle>Outstanding Payment</DialogTitle>
              <DialogDescription>
                This member has {getAmountText(outstandingAmount)} outstanding.
                Do you want to continue with plan upgrade?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={continueFromOutstanding} disabled={isSubmitting}>
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'active-plan-warning' && (
          <>
            <DialogHeader>
              <DialogTitle>Current Plan Active</DialogTitle>
              <DialogDescription>
                This user&apos;s current plan is active and has {daysLeft} day
                {daysLeft === 1 ? '' : 's'} left. Are you sure want to move to a
                different plan?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStep('form')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void submitUpgrade()}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Upgrading...' : 'Continue'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
