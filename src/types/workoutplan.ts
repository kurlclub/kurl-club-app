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
];

export const DEFAULT_EXERCISES: Record<string, string[]> = {
  chest: [
    'Bench Press',
    'Incline Bench Press',
    'Decline Bench Press',
    'Dumbbell Press',
    'Incline Dumbbell Press',
    'Dumbbell Fly',
    'Cable Fly',
    'Chest Dips',
    'Push-Ups',
    'Machine Chest Press',
    'Pec Deck',
  ],

  back: [
    'Pull-Ups',
    'Chin-Ups',
    'Lat Pulldowns',
    'Bent Over Barbell Rows',
    'Dumbbell Rows',
    'T-Bar Rows',
    'Seated Cable Rows',
    'Deadlifts',
    'Rack Pulls',
    'Straight Arm Pulldown',
    'Back Extensions',
  ],

  legs: [
    'Barbell Squats',
    'Front Squats',
    'Leg Press',
    'Hack Squat',
    'Lunges',
    'Walking Lunges',
    'Bulgarian Split Squat',
    'Leg Extensions',
    'Leg Curls',
    'Romanian Deadlifts',
    'Glute Bridges',
    'Hip Thrusts',
    'Calf Raises',
    'Seated Calf Raises',
  ],

  shoulders: [
    'Overhead Press',
    'Dumbbell Shoulder Press',
    'Arnold Press',
    'Lateral Raises',
    'Cable Lateral Raises',
    'Front Raises',
    'Face Pulls',
    'Reverse Pec Deck',
    'Upright Rows',
    'Shrugs',
  ],

  biceps: [
    'Barbell Curls',
    'EZ Bar Curls',
    'Dumbbell Curls',
    'Hammer Curls',
    'Preacher Curls',
    'Concentration Curls',
    'Cable Curls',
    'Incline Dumbbell Curls',
    'Spider Curls',
  ],

  triceps: [
    'Tricep Pushdowns',
    'Overhead Tricep Extensions',
    'Dumbbell Skull Crushers',
    'EZ Bar Skull Crushers',
    'Bench Dips',
    'Diamond Push-Ups',
    'Cable Overhead Extensions',
    'Close Grip Bench Press',
    'Kickbacks',
  ],

  core: [
    'Planks',
    'Side Planks',
    'Crunches',
    'Bicycle Crunches',
    'Russian Twists',
    'Leg Raises',
    'Hanging Leg Raises',
    'Mountain Climbers',
    'Ab Rollouts',
    'Flutter Kicks',
    'Toe Touches',
  ],
};
