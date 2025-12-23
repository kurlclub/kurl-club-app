import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const DatePickerSchema = z.object({
  dateOfBirth: z.date({
    error: (issue) =>
      issue.input === undefined ? undefined : 'Invalid date format',
  }),
});

export const createMemberSchema = z
  .object({
    profilePicture: z
      .custom<File | null>((value) => value instanceof File || value === null, {
        error: 'Profile picture must be a file.',
      })
      .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
        error: 'File size must be less than 5MB',
      })
      .optional(),
    memberName: z
      .string()
      .min(1, 'Member name is required')
      .max(50, 'Member name must not exceed 50 characters'),
    dob: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Please select a valid Date of Birth.',
      }),
    doj: z.iso.datetime('Please select a valid Date of Joining.'),
    bloodGroup: z.string().min(1, 'Blood group selection is required'),
    gender: z.string().min(1, 'Gender selection is required'),
    membershipPlanId: z.string().min(1, 'Package selection is required'),
    feeStatus: z.string().min(1, 'Fee status is required'),
    phone: z
      .string()
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must not exceed 15 digits')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be valid'),
    email: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return z.string().email().safeParse(val).success;
        },
        { message: 'Invalid email format' }
      ),
    height: z.string().min(1, 'Height is required'),
    weight: z.string().min(1, 'Weight is required'),
    personalTrainer: z
      .union([z.string(), z.number()])
      .refine((val) => String(val) !== '' && String(val) !== '0', {
        message: 'Personal trainer selection is required',
      }),
    address: z
      .string()
      .min(1, 'Address is required.')
      .max(250, 'Address must not exceed 250 characters.'),
    amountPaid: z.string().optional(),
    workoutPlanId: z.string().min(1, 'Workout plan selection is required'),
    modeOfPayment: z.string().optional(),

    customSessionRate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return Number(val) > 0;
        },
        { message: 'Session rate must be greater than 0' }
      ),
    numberOfSessions: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return Number(val) > 0;
        },
        { message: 'Number of sessions must be greater than 0' }
      ),
    idType: z.string().optional(),
    idNumber: z
      .string()
      .max(20, 'ID number must not exceed 20 characters')
      .optional(),
    idCopyPath: z
      .custom<File | null | string>(
        (value) =>
          value instanceof File || value === null || value === 'existing',
        {
          error: 'ID copy must be a file.',
        }
      )
      .refine(
        (file) =>
          file === null ||
          file === 'existing' ||
          (file instanceof File && file.size <= 4 * 1024 * 1024),
        {
          error: 'File size must be less than 4MB',
        }
      )
      .optional(),
    fitnessGoal: z.string().optional(),
    medicalHistory: z
      .string()
      .max(250, 'Medical history must not exceed 250 characters')
      .optional(),
    emergencyContactName: z
      .string()
      .max(50, 'Emergency contact name must not exceed 50 characters')
      .optional(),
    emergencyContactPhone: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val || val === '') return true;
          return (
            val.length >= 10 &&
            val.length <= 15 &&
            /^\+?[1-9]\d{1,14}$/.test(val)
          );
        },
        { message: 'Phone number must be valid' }
      ),
    emergencyContactRelation: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // If fee status is not 'unpaid', ensure amountPaid and modeOfPayment are provided and valid
    if (data.feeStatus && data.feeStatus !== 'unpaid') {
      // Validate Amount Paid presence
      if (!data.amountPaid || String(data.amountPaid).trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Amount paid is required when fee status is not unpaid',
          path: ['amountPaid'],
        });
      } else {
        const amt = Number(String(data.amountPaid));
        if (Number.isNaN(amt) || amt <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Amount paid must be a number greater than 0',
            path: ['amountPaid'],
          });
        }
      }

      // Validate mode of payment presence
      if (!data.modeOfPayment || String(data.modeOfPayment).trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Payment method is required when fee status is not unpaid',
          path: ['modeOfPayment'],
        });
      }
    }
  });

export const workoutPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Description is required'),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  durationInDays: z.number().min(1, 'Duration must be at least 1 day'),
  isDefault: z.boolean(),
});

export const trainerFormSchema = z.object({
  ProfilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
      error: 'File size must be less than 5MB',
    })
    .optional(),
  TrainerName: z.string().min(2, {
    error: 'Name must be at least 2 characters.',
  }),
  Email: z
    .email({
      error: 'Please enter a valid email address.',
    })
    .optional(),
  Phone: z.string().min(10, {
    error: 'Phone number must be at least 10 digits.',
  }),
  Dob: z.iso.datetime('Please select a valid Date of Birth.').optional(),
  Doj: z.iso.datetime('Please select a valid Date of Joining.'),
  Certification: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .min(1, 'Certification is required'),
  Gender: z.string().min(1, 'Gender selection is required'),
  AddressLine: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  BloodGroup: z.string().min(1, 'Blood group selection is required'),
  Username: z.string().email('Please enter a valid email address'),
  Password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const adminstratorFormSchema = z.object({
  ProfilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
      error: 'File size must be less than 5MB',
    })
    .optional(),
  Name: z.string().min(2, {
    error: 'Name must be at least 2 characters.',
  }),
  Email: z
    .email({
      error: 'Please enter a valid email address.',
    })
    .optional(),
  Phone: z.string().min(10, {
    error: 'Phone number must be at least 10 digits.',
  }),
  Dob: z.iso.datetime('Please select a valid Date of Birth.').optional(),
  Doj: z.iso.datetime('Please select a valid Date of Joining.'),
  Gender: z.string().min(1, 'Gender selection is required'),
  AddressLine: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  bloodGroup: z.string().min(1, 'Blood group selection is required'),
});

export const GymDataDetailsSchema = z.object({
  ProfilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
      error: 'File size must be less than 5MB',
    })
    .optional(),
  GymName: z.string().min(2, {
    error: 'Name must be at least 2 characters.',
  }),
  Email: z.email({
    error: 'Please enter a valid email address.',
  }),
  Phone: z.string().min(10, {
    error: 'Phone number must be at least 10 digits.',
  }),
  Address: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  socialLinks: z
    .array(
      z.object({
        url: z
          .string()
          .refine(
            (val) => val === '' || z.string().url().safeParse(val).success,
            {
              message: 'Please enter a valid URL',
            }
          ),
      })
    )
    .optional(),
});

export const dayBufferSchema = z.object({
  fee_buffer_amount: z.string().min(1, 'buffer amount is required'),
  fee_buffer_days: z.string().min(1, 'buffer day is required'),
  plan: z.string().min(1, 'plan selection is required'),
});

export const paymentFormSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number(val);
    return num >= 1;
  }, 'Amount must be at least 1'),
  method: z.string().min(1, 'Payment method is required'),
  extendDays: z.string().refine((val) => {
    const num = Number(val);
    return num >= 1;
  }, 'Days must be at least 1'),
});

export const bufferSchema = z.object({
  feeBufferAmount: z.string().min(1, 'Amount is required'),
  feeBufferDays: z.string().min(1, 'Days is required'),
  membershipPlanId: z.string().min(1, 'Plan is required'),
});

export const gymUpdateSchema = z.object({
  Id: z.number(),
  GymName: z.string().min(1, 'Gym name is required'),
  Location: z.string().min(1, 'Location is required'),
  ContactNumber1: z.string().min(1, 'Contact number is required'),
  ContactNumber2: z.string().optional(),
  Email: z.string().email('Invalid email format'),
  SocialLinks: z.string().optional(),
  ProfilePicture: z.instanceof(File).optional().nullable(),
  Status: z.string().optional(),
});

export const membershipPlanSchema = z.object({
  planName: z.string().min(1, 'Plan name is required'),
  billingType: z.enum(['Recurring', 'PerSession'], {
    error: 'Billing type is required',
  }),
  fee: z.union([
    z.string().min(1, 'Fee is required'),
    z.number().min(1, 'Fee must be greater than 0'),
  ]),
  details: z.string().optional(),
  durationInDays: z.union([
    z.string().min(1, 'Duration is required'),
    z.number().min(1, 'Duration must be at least 1 day'),
  ]),
  defaultSessionRate: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '') return true;
        const num = typeof val === 'string' ? Number(val) : val;
        return num > 0;
      },
      { message: 'Session rate must be greater than 0' }
    ),
});

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(20, 'Password must not exceed 20 characters')
      .superRefine((value, ctx) => {
        if (!/[A-Z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password must contain at least one uppercase letter',
          });
        }
        if (!/[a-z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password must contain at least one lowercase letter',
          });
        }
        if (!/[0-9]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password must contain at least one number',
          });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password must contain at least one special character',
          });
        }
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
