'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSheet } from '@/hooks/use-sheet';
import { useWorkoutPlans } from '@/hooks/use-workout-plan';
import { useGymBranch } from '@/providers/gym-branch-provider';
import type { WorkoutPlan } from '@/types/workoutplan';

import { WorkoutCard } from './workout-card';
import { WorkoutPlanSheet } from './workout-plan-sheet';

export function WorkoutPlanner() {
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const { isOpen, openSheet, closeSheet } = useSheet();
  const { gymBranch } = useGymBranch();
  const { plans, createPlan, updatePlan, deletePlan, isLoading } =
    useWorkoutPlans();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return');
  const isFromSetup = searchParams.get('setup') === 'true';

  useEffect(() => {
    // If user came from setup and has plans, redirect back to return URL
    if (isFromSetup && returnUrl && plans.length > 0) {
      router.push(`${returnUrl}?setup=true`);
    }
  }, [isFromSetup, returnUrl, plans.length, router]);

  const handleCreatePlan = () => {
    if (!gymBranch?.gymId) {
      return;
    }
    setSelectedPlan(null);
    openSheet();
  };

  const handleSaveNewPlan = async (newPlan: WorkoutPlan) => {
    if (!gymBranch?.gymId) return;
    const planWithGymId = {
      ...newPlan,
      gymId: gymBranch.gymId,
    };
    const success = await createPlan(planWithGymId);
    if (success) {
      closeSheet();
    }
  };

  const handleUpdatePlan = async (updatedPlan: WorkoutPlan) => {
    if (!gymBranch?.gymId) return;
    const updatedPlanWithGymId = {
      ...updatedPlan,
      gymId: gymBranch.gymId,
    };
    const success = await updatePlan({
      id: updatedPlan.planId,
      plan: updatedPlanWithGymId,
    });
    if (success) {
      if (!updatedPlan.isDefault) {
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
            Workout Plans
          </h1>
          <p className="text-muted-foreground text-[14px]">
            Create and manage your personalized workout routines
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
            <Skeleton key={i} className="w-full h-[250px] rounded-xl" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-400">
              No workout plans found. Create your first plan!
            </p>
          </div>
        ) : (
          plans.map((plan, index) => (
            <WorkoutCard
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
      <WorkoutPlanSheet
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
