export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

export interface Category {
  category: string;
  exercises: Exercise[];
}

export interface DayPlan {
  day: string;
  categories: Category[];
}

export interface WorkoutPlan {
  gymId: number;
  planId: number;
  planName: string;
  description: string;
  duration: number;
  difficultyLevel: DifficultyLevel;
  isDefault: boolean;
  workouts: DayPlan[];
}

export const MUSCLE_GROUPS: string[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'custom',
];

export const DEFAULT_EXERCISES: Record<string, string[]> = {
  chest: ['Bench Press', 'Incline Press', 'Dumbbell Flies', 'Push-Ups'],
  back: ['Pull-Ups', 'Bent Over Rows', 'Lat Pulldowns', 'Deadlifts'],
  legs: ['Squats', 'Leg Press', 'Lunges', 'Calf Raises'],
  shoulders: ['Overhead Press', 'Lateral Raises', 'Front Raises', 'Face Pulls'],
  biceps: [
    'Barbell Curls',
    'Hammer Curls',
    'Preacher Curls',
    'Concentration Curls',
  ],
  triceps: [
    'Tricep Pushdowns',
    'Skull Crushers',
    'Diamond Push-Ups',
    'Overhead Extensions',
  ],
  core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises'],
  custom: [],
};
