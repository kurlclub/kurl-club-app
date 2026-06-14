'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ChevronLeft, Plus } from 'lucide-react';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useGymMembers } from '@/services/member';
import type { Exercise, WorkoutPlan } from '@/types/workoutplan';

import { AddExercise } from './add-exercise';
import { ExerciseList } from './exercise-list';
import { Overview } from './overview';
import { Schedule } from './schedule';

interface WorkoutPlanSheetProps {
  plan: WorkoutPlan | null;
  isOpen: boolean;
  onUpdate: (plan: WorkoutPlan) => void;
  onDelete: (planId: number) => void;
  onSaveNew: (plan: WorkoutPlan) => void;
  closeSheet: () => void;
}

const DEFAULT_PLAN: WorkoutPlan = {
  planId: 0,
  gymId: 0,
  planName: '',
  description: '',
  duration: NaN,
  difficultyLevel: 'beginner',
  isDefault: false,
  workouts: [],
};

type OverviewErrors = {
  planName?: string;
  description?: string;
  duration?: string;
};

export function WorkoutPlanSheet({
  plan,
  isOpen,
  closeSheet,
  onUpdate,
  onDelete,
  onSaveNew,
}: WorkoutPlanSheetProps) {
  const sheetInstanceKey = `${isOpen ? 'open' : 'closed'}-${plan?.planId ?? 'new'}`;

  return (
    <WorkoutPlanSheetInner
      key={sheetInstanceKey}
      plan={plan}
      isOpen={isOpen}
      closeSheet={closeSheet}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onSaveNew={onSaveNew}
    />
  );
}

function WorkoutPlanSheetInner({
  plan,
  isOpen,
  closeSheet,
  onUpdate,
  onDelete,
  onSaveNew,
}: WorkoutPlanSheetProps) {
  const initialPlan = plan || DEFAULT_PLAN;
  const router = useRouter();
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(initialPlan);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(!plan);
  const [showSchedule, setShowSchedule] = useState(!!plan);
  const [errors, setErrors] = useState<OverviewErrors>({});

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    setEditedPlan(updatedPlan);
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  };

  const { showConfirm, showAlert } = useAppDialog();

  const { gymBranch } = useGymBranch();
  const workoutPlanFilter = plan ? String(editedPlan.planId) : undefined;
  const { data: planMembersData } = useGymMembers(
    isOpen && workoutPlanFilter && gymBranch?.gymId ? gymBranch.gymId : 0,
    {
      page: 1,
      pageSize: 3,
      workoutPlan: workoutPlanFilter,
    }
  );
  const planMembers = planMembersData?.data || [];
  const planMemberCount = planMembersData?.pagination?.totalCount || 0;

  const handleSavePlan = () => {
    const validationErrors: OverviewErrors = {};
    if (!editedPlan.planName?.trim()) {
      validationErrors.planName = 'Plan name is required';
    }
    if (!editedPlan.description?.trim()) {
      validationErrors.description = 'Description is required';
    }
    if (
      editedPlan.duration === undefined ||
      Number.isNaN(editedPlan.duration) ||
      editedPlan.duration <= 0
    ) {
      validationErrors.duration = 'Duration must be greater than 0';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const hasExercises =
      !!editedPlan.workouts &&
      editedPlan.workouts.some(
        (w) =>
          w.categories &&
          w.categories.some((c) => c.exercises && c.exercises.length > 0)
      );

    if (!hasExercises) {
      showAlert({
        title: 'Add at least one exercise',
        description:
          'Please add at least one exercise to the workout plan before saving.',
      });
      return;
    }
    if (plan) {
      onUpdate(editedPlan);
    } else {
      onSaveNew(editedPlan);
    }
    setIsEditMode(false);
    closeSheet();
  };

  const handleDeletePlan = () => {
    showConfirm({
      title: `Are you absolutely sure?`,
      description: `This action cannot be undone. This will permanently delete your workout plan and remove it from our servers.`,
      variant: 'destructive',
      confirmLabel: 'Yes, delete plan',
      onConfirm: () => {
        if (plan) {
          onDelete(plan.planId);
        }
        closeSheet();
      },
    });
  };

  const handleUpdateExercise = (
    day: string,
    category: string,
    exerciseIndex: number,
    updates: Partial<Exercise>
  ) => {
    setEditedPlan((prev) => ({
      ...prev,
      workouts: prev.workouts.map((w) =>
        w.day === day
          ? {
              ...w,
              categories: w.categories.map((c) =>
                c.category === category
                  ? {
                      ...c,
                      exercises: c.exercises.map((e, index) =>
                        index === exerciseIndex ? { ...e, ...updates } : e
                      ),
                    }
                  : c
              ),
            }
          : w
      ),
    }));
  };

  const handleRemoveExercise = (
    day: string,
    category: string,
    exerciseIndex: number
  ) => {
    setEditedPlan((prev) => ({
      ...prev,
      workouts: prev.workouts
        .map((w) =>
          w.day === day
            ? {
                ...w,
                categories: w.categories
                  .map((c) =>
                    c.category === category
                      ? {
                          ...c,
                          exercises: c.exercises.filter(
                            (_, index) => index !== exerciseIndex
                          ),
                        }
                      : c
                  )
                  .filter((c) => c.exercises.length > 0),
              }
            : w
        )
        .filter((w) => w.categories.length > 0),
    }));
  };

  const handleAddExercise = (
    day: string,
    category: string,
    exercise: Exercise
  ) => {
    setEditedPlan((prev) => {
      const existingDayPlan = prev.workouts.find((w) => w.day === day);
      if (existingDayPlan) {
        const existingCategory = existingDayPlan.categories.find(
          (c) => c.category === category
        );
        if (existingCategory) {
          return {
            ...prev,
            workouts: prev.workouts.map((w) =>
              w.day === day
                ? {
                    ...w,
                    categories: w.categories.map((c) =>
                      c.category === category
                        ? { ...c, exercises: [...c.exercises, exercise] }
                        : c
                    ),
                  }
                : w
            ),
          };
        } else {
          return {
            ...prev,
            workouts: prev.workouts.map((w) =>
              w.day === day
                ? {
                    ...w,
                    categories: [
                      ...w.categories,
                      { category, exercises: [exercise] },
                    ],
                  }
                : w
            ),
          };
        }
      } else {
        return {
          ...prev,
          workouts: [
            ...prev.workouts,
            { day, categories: [{ category, exercises: [exercise] }] },
          ],
        };
      }
    });
  };

  const handleCancel = () => {
    if (!plan) {
      closeSheet();
    } else {
      setEditedPlan(initialPlan);
      setIsEditMode(false);
    }
  };

  const handleImmediateUpdate = (updatedPlan: WorkoutPlan) => {
    onUpdate(updatedPlan);
    setEditedPlan(updatedPlan);
  };

  const handleShowMembers = () => {
    const workoutPlan = encodeURIComponent(String(editedPlan.planId));
    closeSheet();
    router.push(`/members?workoutPlan=${workoutPlan}`);
  };

  const sheetTitle = (() => {
    if (selectedDay) {
      return (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => {
              setEditedPlan(initialPlan);
              setSelectedDay(null);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {selectedDay} Workout
        </div>
      );
    }

    return editedPlan.planName || 'New Workout Plan';
  })();

  const sheetFooter = (() => {
    if (selectedDay && isEditMode) {
      return (
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setEditedPlan(initialPlan);
              setSelectedDay(null);
            }}
            variant="secondary"
            className="h-[46px] min-w-[90px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSelectedDay(null);
            }}
            className="h-[46px] min-w-[73px]"
          >
            Add
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-end gap-3">
        {isEditMode ? (
          <>
            <Button
              type="button"
              onClick={handleCancel}
              variant="secondary"
              className="h-[46px] min-w-[90px]"
            >
              Cancel
            </Button>
            <Button onClick={handleSavePlan} className="h-[46px] min-w-[73px]">
              Save Changes
            </Button>
          </>
        ) : (
          <Button variant="destructive" onClick={handleDeletePlan}>
            Delete plan
          </Button>
        )}
      </div>
    );
  })();

  return (
    <KSheet
      className="w-[585px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title={sheetTitle}
      footer={sheetFooter}
    >
      {selectedDay ? (
        <div className="space-y-6">
          {isEditMode && (
            <AddExercise
              onAddExercise={(exercise, category) =>
                handleAddExercise(selectedDay, category, exercise)
              }
            />
          )}

          <ExerciseList
            dayPlan={
              editedPlan.workouts.find((w) => w.day === selectedDay) || {
                day: selectedDay,
                categories: [],
              }
            }
            isEditMode={isEditMode}
            onUpdateExercise={(category, exerciseIndex, updates) =>
              handleUpdateExercise(
                selectedDay,
                category,
                exerciseIndex,
                updates
              )
            }
            onRemoveExercise={(category, exerciseIndex) =>
              handleRemoveExercise(selectedDay, category, exerciseIndex)
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          <Overview
            plan={editedPlan}
            planMembers={planMembers}
            planMemberCount={planMemberCount}
            isEditMode={isEditMode}
            isNewPlan={!plan}
            errors={errors}
            onUpdatePlan={handleUpdatePlan}
            onImmediateUpdate={handleImmediateUpdate}
            onDelete={handleDeletePlan}
            onEdit={() => setIsEditMode(!isEditMode)}
            onShowMembers={handleShowMembers}
          />

          {!plan && !showSchedule ? (
            <Button
              variant="outline"
              className="h-10"
              onClick={() => setShowSchedule(true)}
            >
              <Plus className=" h-4 w-4 text-primary-green-300" />
              Add Exercise
            </Button>
          ) : (
            <Schedule
              plan={editedPlan}
              isEditMode={isEditMode}
              onEditDay={setSelectedDay}
            />
          )}
        </div>
      )}
    </KSheet>
  );
}
