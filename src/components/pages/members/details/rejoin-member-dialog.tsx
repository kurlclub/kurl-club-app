'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useAuth } from '@/providers/auth-provider';
import { rejoinMember } from '@/services/member';
import type { MemberDetails } from '@/types/member.types';
import { formatCurrency } from '@/utils/format-currency';

type RejoinFormValues = {
  rejoinDate: string;
  targetPlanId: string;
  planFeePaid: string;
  joiningFee: string;
  duesCollected: string;
  paymentMethod: string;
  notes: string;
};

type RejoinMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  member?: MemberDetails | null;
  plans: FormOptionsResponse['membershipPlans'];
  onRejoinSuccess?: () => void;
};

const getDefaultValues = (): RejoinFormValues => ({
  rejoinDate: toUtcDateOnlyISOString(new Date()),
  targetPlanId: '',
  planFeePaid: '',
  joiningFee: '',
  duesCollected: '',
  paymentMethod: '',
  notes: '',
});

export function RejoinMemberDialog({
  open,
  onOpenChange,
  memberId,
  member,
  plans,
  onRejoinSuccess,
}: RejoinMemberDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const autoFilledFeeRef = useRef<string>('');
  const form = useForm<RejoinFormValues>({ defaultValues: getDefaultValues() });

  const selectedPlanId = useWatch({
    control: form.control,
    name: 'targetPlanId',
  });

  const selectedPlan = useMemo(
    () =>
      plans.find((plan) => String(plan.membershipPlanId) === selectedPlanId),
    [plans, selectedPlanId]
  );

  // Auto-fill plan fee when a plan is selected, without clobbering manual edits.
  useEffect(() => {
    if (!selectedPlan) return;
    const fee = String(selectedPlan.fee ?? '');
    const current = form.getValues('planFeePaid');
    if (current === '' || current === autoFilledFeeRef.current) {
      form.setValue('planFeePaid', fee);
      autoFilledFeeRef.current = fee;
    }
  }, [selectedPlan, form]);

  const resetDialog = () => {
    form.reset(getDefaultValues());
    autoFilledFeeRef.current = '';
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (rejoinMutation.isPending) return;
    onOpenChange(nextOpen);
    if (!nextOpen) resetDialog();
  };

  const rejoinMutation = useMutation({
    mutationFn: (values: RejoinFormValues) =>
      rejoinMember(memberId, {
        rejoinDate: toUtcDateOnlyISOString(values.rejoinDate),
        newMembershipPlanId: Number(values.targetPlanId),
        planFeePaid: Number(values.planFeePaid) || 0,
        joiningFee: Number(values.joiningFee) || 0,
        duesCollected: Number(values.duesCollected) || 0,
        paymentMethod: values.paymentMethod,
        notes: values.notes.trim(),
        performedBy: user?.userId ?? 0,
      }),
    onSuccess: async (response) => {
      toast.success(response?.message || 'Member rejoined successfully.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['member', memberId] }),
        queryClient.invalidateQueries({ queryKey: ['gymMembers'] }),
        queryClient.invalidateQueries({ queryKey: ['allGymMembers'] }),
      ]);
      onRejoinSuccess?.();
      onOpenChange(false);
      resetDialog();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rejoin member.'
      );
    },
  });

  const handleRejoin = (values: RejoinFormValues) => {
    if (!values.targetPlanId) {
      toast.error('Please select a membership plan.');
      return;
    }
    if (!values.rejoinDate) {
      toast.error('Please select a rejoin date.');
      return;
    }
    rejoinMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-primary-blue-500 border-secondary-blue-500 text-white sm:max-w-140">
        <DialogHeader>
          <DialogTitle>Rejoin Member</DialogTitle>
          <DialogDescription>
            Reactivate {member?.memberName ?? 'this member'} with a fresh plan
            and payment details.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="grid gap-4">
            <div>
              <KFormField
                control={form.control}
                fieldType={KFormFieldType.SELECT}
                name="targetPlanId"
                label="Membership plan"
                options={plans.map((plan) => ({
                  label: plan.planName,
                  value: String(plan.membershipPlanId),
                }))}
                className="bg-secondary-blue-500 border-primary-blue-300 text-white"
                enableSearch
              />
              {selectedPlan && (
                <p className="mt-1.5 text-xs text-primary-blue-100">
                  Plan fee: {formatCurrency(selectedPlan.fee)} ·{' '}
                  {selectedPlan.durationInDays} days
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <KFormField
                control={form.control}
                fieldType={KFormFieldType.DATE_PICKER}
                name="rejoinDate"
                label="Rejoin date"
                mode="single"
                floating
                showPresets={false}
                iconSrc={<Calendar />}
                className="bg-secondary-blue-500 border-primary-blue-300 text-white w-full justify-between"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <KFormField
                control={form.control}
                fieldType={KFormFieldType.INPUT}
                name="planFeePaid"
                label="Plan fee paid"
                type="number"
                className="bg-secondary-blue-500 border-primary-blue-300 text-white"
              />
              <KFormField
                control={form.control}
                fieldType={KFormFieldType.INPUT}
                name="joiningFee"
                label="Joining fee"
                type="number"
                className="bg-secondary-blue-500 border-primary-blue-300 text-white"
              />
              <KFormField
                control={form.control}
                fieldType={KFormFieldType.INPUT}
                name="duesCollected"
                label="Dues collected"
                type="number"
                className="bg-secondary-blue-500 border-primary-blue-300 text-white"
              />
            </div>

            <KFormField
              control={form.control}
              fieldType={KFormFieldType.TEXTAREA}
              name="notes"
              label="Notes"
              className="bg-secondary-blue-500 border-primary-blue-300 text-white min-h-20"
            />
          </div>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={rejoinMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleRejoin)}
            disabled={rejoinMutation.isPending}
          >
            {rejoinMutation.isPending ? 'Rejoining...' : 'Rejoin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
