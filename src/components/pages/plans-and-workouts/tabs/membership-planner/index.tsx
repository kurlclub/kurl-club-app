'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMembershipPlans } from '@/hooks/use-membership-plan';
import { useSheet } from '@/hooks/use-sheet';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { MembershipPlan } from '@/types/membership-plan';

import { MembershipCard } from './membership-card';
import { MembershipPlanSheet } from './membership-plan-sheet';

export function PackageManager() {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const { plans, createPlan, updatePlan, deletePlan, isLoading } =
    useMembershipPlans();

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return');
  const isFromSetup = searchParams.get('setup') === 'true';

  const handleCreatePlan = () => {
    if (!gymBranch?.gymId) {
      return;
    }
    setSelectedPlan(null);
    openSheet();
  };

  const handleSaveNewPlan = async (newPlan: MembershipPlan) => {
    if (!gymBranch?.gymId) return;
    const planWithGymId = {
      ...newPlan,
      gymId: gymBranch.gymId,
    };
    const success = await createPlan(planWithGymId);
    if (success) {
      closeSheet();
      // If user came from setup, redirect back to return URL
      if (isFromSetup && returnUrl) {
        router.push(`${returnUrl}?setup=true`);
      }
    }
  };

  const handleUpdatePlan = async (updatedPlan: MembershipPlan) => {
    if (!gymBranch?.gymId) return;
    const updatedPlanWithGymId = {
      ...updatedPlan,
      gymId: gymBranch.gymId,
    };
    const success = await updatePlan({
      id: updatedPlan.membershipPlanId,
      plan: updatedPlanWithGymId,
    });
    if (success) {
      if (!updatedPlan.isActive) {
        closeSheet();
      }
    }
  };

  const handleDeletePlan = async (planId: number) => {
    const success = await deletePlan(planId);
    if (success) {
      closeSheet();
    }
  };

  if (!gymBranch?.gymId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-400">
          Please select a gym to view workout plans
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg md:text-2xl font-bold tracking-tight">
            Membership Plans
          </h1>
          <p className="text-muted-foreground text-[14px]">
            Create and manage your gym membership plans
          </p>
        </div>
        <Button onClick={handleCreatePlan}>
          <Plus className="w-5 h-5" />
          Create Plan
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-[400px] rounded-xl" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">
              No membership plans available. Click &quot;Create Plan&quot; to
              add one.
            </p>
          </div>
        ) : (
          plans.map((plan, index) => (
            <MembershipCard
              key={index}
              plan={plan}
              onClick={() => {
                setSelectedPlan(plan);
                openSheet();
              }}
            />
          ))
        )}
      </div>
      <MembershipPlanSheet
        plan={selectedPlan}
        isOpen={isOpen}
        closeSheet={closeSheet}
        onUpdate={handleUpdatePlan}
        onDelete={handleDeletePlan}
        onSaveNew={handleSaveNewPlan}
      />
    </div>
  );
}
