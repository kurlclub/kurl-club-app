'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { ArrowUpRight, Dumbbell } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { DifficultyLevel, WorkoutPlan } from '@/types/workoutplan';

interface WorkoutCardProps {
  plan: WorkoutPlan;
  onClick: () => void;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const diffText: Record<DifficultyLevel, string> = {
  beginner: 'text-neutral-green-400',
  intermediate: 'text-neutral-ochre-400',
  advanced: 'text-alert-red-400',
};

// Cleaned two-zone × Ticket Stub: duration stub on the left, dashed tear line
// with punch-hole notches, then a header zone + a stats/weekday body zone.
export function WorkoutCard({ plan, onClick }: WorkoutCardProps) {
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

  const activeDays = WEEKDAYS.filter((day) =>
    plan.workouts?.some((workout) =>
      workout.day.toLowerCase().startsWith(day.toLowerCase())
    )
  ).length;

  // Only surface "Read more" when the clamped description actually overflows.
  const descRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [plan.description]);

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer rounded-md border border-white/15 bg-secondary-blue-700 transition-colors hover:border-white/30"
    >
      {/* Stub — duration */}
      <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 rounded-l-md bg-white/3 p-3 text-center">
        <span className="text-2xl font-bold leading-none text-white">
          {plan.duration}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-white/45">
          days
        </span>
      </div>

      {/* Perforation + two-zone main */}
      <div className="relative flex flex-1 flex-col border-l border-dashed border-white/20">
        {/* Punch-hole notches — fill matches the StudioLayout page background */}
        <span className="absolute left-0 top-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background-dark" />
        <span className="absolute bottom-0 left-0 size-3.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-background-dark" />

        {/* Zone 1 — header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-white">
              {plan.planName}
            </h3>
            <span
              className={cn(
                'shrink-0 text-xs font-medium capitalize',
                diffText[plan.difficultyLevel]
              )}
            >
              {plan.difficultyLevel}
            </span>
          </div>
          <p
            ref={descRef}
            className="mt-1 line-clamp-2 text-[13px] leading-snug text-white/55"
          >
            {plan.description}
          </p>
          {isTruncated && (
            <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary-green-300/80 transition-colors group-hover:text-primary-green-200">
              Read more
              <ArrowUpRight className="size-3" />
            </span>
          )}
        </div>

        {/* Zone 2 — stats + weekday strip */}
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center gap-1.5 text-xs text-white/55">
            <Dumbbell className="size-3.5 text-white/35" />
            <span>
              <span className="font-semibold text-white">{totalExercises}</span>{' '}
              exercises ·{' '}
              <span className="font-semibold text-white">{activeDays}</span>{' '}
              days / week
            </span>
          </div>
          <div className="flex gap-1">
            {WEEKDAYS.map((day) => {
              const hasWorkout = plan.workouts?.some((workout) =>
                workout.day.toLowerCase().startsWith(day.toLowerCase())
              );
              return (
                <span
                  key={day}
                  className={cn(
                    'flex-1 rounded py-1 text-center text-[10px]',
                    hasWorkout
                      ? 'bg-primary-green-500/20 text-primary-green-100'
                      : 'bg-white/5 text-white/30'
                  )}
                >
                  {day[0]}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
