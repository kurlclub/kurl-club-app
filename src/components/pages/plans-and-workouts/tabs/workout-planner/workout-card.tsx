import { Calendar, Timer } from 'lucide-react';

import { Card, CardFooter } from '@/components/ui/card';
import { getDifficultyColor } from '@/lib/utils';
import type { WorkoutPlan } from '@/types/workoutplan';

interface WorkoutCardProps {
  plan: WorkoutPlan;
  onClick: () => void;
}

export function WorkoutCard({ plan, onClick }: WorkoutCardProps) {
  // Calculate the total number of exercises safely
  const totalExercises =
    plan.workouts?.reduce(
      (acc, workout) =>
        acc +
        (workout.categories?.reduce(
          (catAcc, category) => catAcc + (category.exercises?.length || 0),
          0
        ) || 0),
      0
    ) || 0;

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-md hover:shadow-primary-green-500/10 border border-white/5 hover:border-primary-green-500/30 bg-gradient-to-br from-secondary-blue-500 to-secondary-blue-600 overflow-hidden h-72 sm:h-80 backdrop-blur-sm flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="relative p-3 sm:p-4 bg-gradient-to-r from-primary-green-500/10 to-transparent border-b border-white/5 shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-white font-semibold text-base sm:text-lg leading-tight group-hover:text-primary-green-200 transition-colors duration-300 flex-1">
              {plan.planName}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full shrink-0 capitalize ${getDifficultyColor(plan.difficultyLevel)}`}
            >
              {plan.difficultyLevel}
            </span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
            {plan.description}
          </p>
        </div>
      </div>

      {/* Content - Stats */}
      <div className="p-3 sm:p-4 flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-white/5 group-hover:bg-primary-green-500/10 transition-colors">
              <Calendar className="w-5 h-5 text-primary-green-200 mx-auto mb-1" />
              <p className="text-xs text-white/60 mb-1">Duration</p>
              <p className="text-lg font-bold text-white">{plan.duration}</p>
              <p className="text-xs text-white/60">days</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/5 group-hover:bg-primary-green-500/10 transition-colors">
              <Timer className="w-5 h-5 text-primary-green-200 mx-auto mb-1" />
              <p className="text-xs text-white/60 mb-1">Exercises</p>
              <p className="text-lg font-bold text-white">{totalExercises}</p>
              <p className="text-xs text-white/60">total</p>
            </div>
          </div>

          {/* Workout Days */}
          <div className="space-y-2">
            <p className="text-xs text-white/60 font-medium text-center">
              Workout Days
            </p>
            <div className="grid grid-cols-7 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                const hasWorkout = plan.workouts?.some((workout) =>
                  workout.day.toLowerCase().startsWith(day.toLowerCase())
                );
                return (
                  <div
                    key={day}
                    className={`text-xs text-center py-1 rounded ${
                      hasWorkout
                        ? 'bg-primary-green-500/30 text-primary-green-50'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <CardFooter className="p-2 sm:p-3 mt-auto shrink-0 border-t border-white/5">
        <span className="text-white/40 text-xs group-hover:text-primary-green-200/60 transition-colors duration-300 mx-auto font-medium">
          Click to edit
        </span>
      </CardFooter>
    </Card>
  );
}
