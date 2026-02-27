import { Dumbbell, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DayPlan, Exercise } from '@/types/workoutplan';

interface ExerciseListProps {
  dayPlan: DayPlan;
  isEditMode: boolean;
  onUpdateExercise?: (
    category: string,
    exerciseIndex: number,
    updates: Partial<Exercise>
  ) => void;
  onRemoveExercise?: (category: string, exerciseIndex: number) => void;
}

export function ExerciseList({
  dayPlan,
  isEditMode,
  onUpdateExercise,
  onRemoveExercise,
}: ExerciseListProps) {
  return (
    <div className="space-y-6">
      {dayPlan.categories.map((category) => (
        <div key={category.category} className="space-y-3">
          <h3 className="font-semibold capitalize inline-flex items-center gap-2">
            <Dumbbell size={16} />
            {category.category}
          </h3>
          {category.exercises.map((exercise, index) => (
            <div
              key={`${category.category}-${index}`}
              className="flex items-center gap-4 px-3 py-2 bg-secondary-blue-400/50 rounded-md"
            >
              <div className="flex-1">
                <p className="text-[13.5px] font-medium">{exercise.name}</p>
              </div>
              {isEditMode && onUpdateExercise && onRemoveExercise ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) =>
                        onUpdateExercise(category.category, index, {
                          sets: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-10 h-8 text-center bg-secondary-blue-500 p-1"
                      min="0"
                    />
                    <span className="mx-1 text-sm text-primary-blue-50">x</span>
                    <Input
                      type="number"
                      value={exercise.reps}
                      onChange={(e) =>
                        onUpdateExercise(category.category, index, {
                          reps: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-10 h-8 text-center bg-secondary-blue-500 p-1"
                      min="0"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveExercise(category.category, index)}
                    className="ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-primary-blue-50">
                  {exercise.sets} x {exercise.reps}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
