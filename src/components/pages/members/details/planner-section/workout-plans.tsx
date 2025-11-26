'use client';

import React, { memo, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { cn } from '@/lib/utils';

interface WorkoutItem {
  id: string;
  name: string;
  duration: string;
  reps?: number;
  completed?: boolean;
}

interface DaySchedule {
  id: string;
  day: string;
  date: string;
  workouts: WorkoutItem[];
  status?: 'completed' | 'active' | 'upcoming';
  isPresent?: boolean;
}

const WorkoutCard = memo(({ workout }: { workout: WorkoutItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: workout.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-[14px] rounded-[4px] bg-primary-blue-300 text-white shadow-md"
      role="button"
      aria-label={`Workout: ${workout.name}`}
    >
      <div
        className={cn(
          'mb-1 text-white text-base font-normal leading-normal',
          workout.completed && 'line-through'
        )}
      >
        {workout.name}
      </div>
      <div className="text-primary-blue-50 text-sm font-normal leading-normal">
        {workout.duration}
        {workout.reps && `, ${workout.reps} reps`}
      </div>
    </div>
  );
});

WorkoutCard.displayName = 'WorkoutCard';

export function WorkoutPlans() {
  const initialSchedule: DaySchedule[] = [
    {
      id: 'day-1',
      day: 'Monday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: true,
      workouts: [
        {
          id: 'workout-1',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: true,
        },
        {
          id: 'workout-2',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-3',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-4',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
      ],
    },
    {
      id: 'day-2',
      day: 'Tuesday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: false,
      workouts: [
        {
          id: 'workout-5',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: true,
        },
        {
          id: 'workout-6',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-7',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-8',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
      ],
    },
    {
      id: 'day-3',
      day: 'Wednesday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: true,
      workouts: [
        {
          id: 'workout-9',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: true,
        },
        {
          id: 'workout-10',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-11',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
        {
          id: 'workout-12',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: true,
        },
      ],
    },
    {
      id: 'day-4',
      day: 'Thursday',
      date: new Date().toLocaleDateString('en-GB'),
      status: 'active',
      isPresent: true,
      workouts: [
        { id: 'workout-13', name: 'Warm - Up', duration: '10 mins' },
        { id: 'workout-14', name: 'Cardio 01', duration: '10 mins', reps: 3 },
        { id: 'workout-15', name: 'Cardio 02', duration: '10 mins', reps: 3 },
        {
          id: 'workout-16',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
        },
        { id: 'workout-17', name: 'Warm - Up', duration: '10 mins' },
        { id: 'workout-18', name: 'Cardio 01', duration: '10 mins', reps: 3 },
        { id: 'workout-19', name: 'Cardio 02', duration: '10 mins', reps: 3 },
        {
          id: 'workout-20',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
        },
      ],
    },
    {
      id: 'day-5',
      day: 'Friday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: false,
      workouts: [
        {
          id: 'workout-9',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: false,
        },
        {
          id: 'workout-10',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-11',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-12',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
      ],
    },
    {
      id: 'day-6',
      day: 'Saturday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: false,
      workouts: [
        {
          id: 'workout-9',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: false,
        },
        {
          id: 'workout-10',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-11',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-12',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
      ],
    },
    {
      id: 'day-7',
      day: 'Sunday',
      date: '02/11/2024',
      status: 'completed',
      isPresent: false,
      workouts: [
        {
          id: 'workout-9',
          name: 'Warm - Up',
          duration: '10 mins',
          completed: false,
        },
        {
          id: 'workout-10',
          name: 'Cardio 01',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-11',
          name: 'Cardio 02',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
        {
          id: 'workout-12',
          name: 'Chest workouts',
          duration: '10 mins',
          reps: 3,
          completed: false,
        },
      ],
    },
  ];

  const [workoutSchedule, setWorkoutSchedule] =
    useState<DaySchedule[]>(initialSchedule);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setWorkoutSchedule((prev) =>
      prev.map((day) => {
        const activeIndex = day.workouts.findIndex((w) => w.id === active.id);
        const overIndex = day.workouts.findIndex((w) => w.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          const updatedWorkouts = arrayMove(
            day.workouts,
            activeIndex,
            overIndex
          );
          return { ...day, workouts: updatedWorkouts };
        }

        return day;
      })
    );
  }

  return (
    <div className="overflow-x-auto p-6">
      <div className="flex gap-4">
        {workoutSchedule.map((day) => (
          <div
            key={day.id}
            className={cn(
              'min-w-[227px] rounded-lg px-3 py-4 pt-5 space-y-4',
              day.date === new Date().toLocaleDateString('en-GB')
                ? 'bg-primary-blue-500'
                : 'bg-primary-blue-500 opacity-50',
              day.isPresent === true &&
                day.date !== new Date().toLocaleDateString('en-GB')
                ? 'border border-neutral-green-500/50'
                : day.isPresent === false
                  ? 'border border-alert-red-400/50'
                  : ''
            )}
            aria-label={`Day: ${day.day}, Status: ${day.status || 'upcoming'}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-[7px] h-[7px] rounded-full',
                    day.isPresent === false
                      ? 'bg-alert-red-500'
                      : day.isPresent === true
                        ? 'bg-neutral-green-500'
                        : 'bg-zinc-500'
                  )}
                />
                <span className="text-white text-base font-normal leading-normal">
                  {day.day}
                </span>
              </div>
              <span className="text-primary-blue-50 text-sm font-normal leading-normal">
                {day.date}
              </span>
            </div>

            <div className="space-y-3 max-h-[343px] overflow-y-auto px-1">
              <DndContext
                id={day.id}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={day.workouts.map((workout) => workout.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {day.workouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
