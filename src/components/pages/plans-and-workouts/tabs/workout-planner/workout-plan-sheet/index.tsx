'use client';

import { useEffect, useState } from 'react';

import { ChevronLeft, Plus } from 'lucide-react';

import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { useAppDialog } from '@/hooks/use-app-dialog';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useGymMembers } from '@/services/member';
import type { Exercise, WorkoutPlan } from '@/types/workoutplan';

import { AddExercise } from './add-exercise';
import { ExerciseList } from './exercise-list';
import { MemberList } from './member-list';
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
  planName: 'New Workout Plan',
  description: 'Add a description for your workout plan',
  duration: 60,
  difficultyLevel: 'beginner',
  isDefault: false,
  workouts: [],
};

export function WorkoutPlanSheet({
  plan,
  isOpen,
  closeSheet,
  onUpdate,
  onDelete,
  onSaveNew,
}: WorkoutPlanSheetProps) {
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan>(
    plan || DEFAULT_PLAN
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMemberListVisible, setIsMemberListVisible] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);

  const { showConfirm } = useAppDialog();

  const { gymBranch } = useGymBranch();
  // Only fetch members if sheet is open and a plan exists and gymId is present
  const { data: members = [] } = useGymMembers(
    isOpen && plan && gymBranch?.gymId ? gymBranch.gymId : 0
  );

  const planMembers = members.filter(
    (member) => member.workoutPlan === editedPlan.planName
  );

  useEffect(() => {
    if (isOpen) {
      setEditedPlan(plan || DEFAULT_PLAN);
      setIsEditMode(!plan);
      setSelectedDay(null);
      setIsMemberListVisible(false);
      setShowSchedule(!!plan);
    }
  }, [plan, isOpen]);

  const handleSavePlan = () => {
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
      setEditedPlan(plan);
      setIsEditMode(false);
    }
  };

  const handleImmediateUpdate = (updatedPlan: WorkoutPlan) => {
    onUpdate(updatedPlan);
    setEditedPlan(updatedPlan);
  };

  const sheetTitle = (() => {
    if (isMemberListVisible) {
      return (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => setIsMemberListVisible(false)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          Members List
        </div>
      );
    }

    if (selectedDay) {
      return (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-2"
            onClick={() => {
              setEditedPlan(plan || DEFAULT_PLAN);
              setSelectedDay(null);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {selectedDay} Workout
        </div>
      );
    }

    return editedPlan.planName;
  })();

  const sheetFooter = (() => {
    if (isMemberListVisible) {
      return null;
    }

    if (selectedDay && isEditMode) {
      return (
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => {
              setEditedPlan(plan || DEFAULT_PLAN);
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
      {isMemberListVisible ? (
        <MemberList members={planMembers} />
      ) : selectedDay ? (
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
            isEditMode={isEditMode}
            isNewPlan={!plan}
            onUpdatePlan={setEditedPlan}
            onImmediateUpdate={handleImmediateUpdate}
            onDelete={handleDeletePlan}
            onEdit={() => setIsEditMode(!isEditMode)}
            onShowMembers={() => setIsMemberListVisible(true)}
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
