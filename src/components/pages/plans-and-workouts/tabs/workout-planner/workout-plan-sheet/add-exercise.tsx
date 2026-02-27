'use client';

import { useState } from 'react';

import { KSelect } from '@/components/shared/form/k-select';
import { KAi } from '@/components/shared/icons';
import {
  DEFAULT_EXERCISES,
  type Exercise,
  MUSCLE_GROUPS,
} from '@/types/workoutplan';

interface AddExerciseProps {
  onAddExercise: (exercise: Exercise, category: string) => void;
}

export function AddExercise({ onAddExercise }: AddExerciseProps) {
  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<string>('chest');
  const [customExercises, setCustomExercises] = useState<
    Record<string, string[]>
  >(() => {
    const savedExercises = localStorage.getItem('customExercises');
    return savedExercises
      ? JSON.parse(savedExercises)
      : Object.fromEntries(MUSCLE_GROUPS.map((group) => [group, []]));
  });

  const handleAddExercise = (
    name: string,
    category: string,
    isCustom = false
  ) => {
    const newExercise: Exercise = {
      name,
      sets: 3,
      reps: 12,
    };
    onAddExercise(newExercise, category);

    if (isCustom) {
      setCustomExercises((prev) => {
        const updated = {
          ...prev,
          [category]: [...(prev[category] || []), name],
        };
        localStorage.setItem('customExercises', JSON.stringify(updated));
        return updated;
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2>Schedule</h2>
        <button>
          <KAi />
        </button>
      </div>
      <div className="space-y-4">
        <div className="w-full flex items-center justify-between">
          <div>
            <KSelect
              label="Muscle Group"
              value={selectedMuscleGroup}
              onValueChange={(value) => setSelectedMuscleGroup(value)}
              options={MUSCLE_GROUPS.map((group) => ({
                label: group.charAt(0).toUpperCase() + group.slice(1),
                value: group,
              }))}
              className="w-[180px]"
            />
          </div>
          <div>
            <KSelect
              label="Exercise"
              value=""
              onValueChange={(value) =>
                handleAddExercise(
                  value,
                  selectedMuscleGroup,
                  customExercises[selectedMuscleGroup]?.includes(value)
                )
              }
              options={[
                ...new Set([
                  ...(DEFAULT_EXERCISES[selectedMuscleGroup] || []),
                  ...(customExercises[selectedMuscleGroup] || []),
                ]),
              ].map((exercise) => ({
                label: exercise,
                value: exercise,
              }))}
              className="w-[180px]"
            />
          </div>
        </div>
      </div>
    </>
  );
}
