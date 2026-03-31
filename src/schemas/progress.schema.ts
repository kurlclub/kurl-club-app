import { z } from 'zod/v4';

export const performanceEntrySchema = z.object({
  exerciseName: z.string().min(1, 'Exercise name is required'),
  sets: z
    .string()
    .min(1, 'Sets is required')
    .refine((val) => Number(val) > 0, {
      message: 'Sets must be greater than 0',
    }),
  reps: z
    .string()
    .min(1, 'Reps is required')
    .refine((val) => Number(val) > 0, {
      message: 'Reps must be greater than 0',
    }),
  weightKg: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) >= 0, {
      message: 'Weight must be 0 or more',
    }),
  notes: z.string().max(200, 'Notes must not exceed 200 characters').optional(),
});

export const progressLogSchema = z.object({
  logDate: z.string().min(1, 'Log date is required'),
  sessionNotes: z
    .string()
    .max(500, 'Notes must not exceed 500 characters')
    .optional(),
  energyLevel: z.string().optional(),
  goalProgressPercent: z
    .string()
    .optional()
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 100), {
      message: 'Goal progress must be between 0 and 100',
    }),

  // Body Metrics
  weight: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Weight must be greater than 0',
    }),
  bodyFatPercent: z
    .string()
    .optional()
    .refine((val) => !val || (Number(val) >= 0 && Number(val) <= 100), {
      message: 'Body fat must be between 0 and 100',
    }),
  chestCm: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Must be greater than 0',
    }),
  waistCm: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Must be greater than 0',
    }),
  hipsCm: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Must be greater than 0',
    }),
  armsCm: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Must be greater than 0',
    }),
  thighsCm: z
    .string()
    .optional()
    .refine((val) => !val || Number(val) > 0, {
      message: 'Must be greater than 0',
    }),

  // Performance Entries
  performanceEntries: z.array(performanceEntrySchema).optional(),
});

export type ProgressLogFormData = z.infer<typeof progressLogSchema>;
