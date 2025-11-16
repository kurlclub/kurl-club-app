import { z } from 'zod/v4';

const isPhoneNumberValid = (phone: string): boolean => {
  // Example validation logic using regex:
  // This regex checks for a valid international phone number format with country code
  const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
  return phoneRegex.test(phone);
};

// Register Schema
export const RegisterSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z
      .string()
      .min(8, {
        error: 'Password must be at least 8 characters',
      })
      .max(20, {
        error: 'Password must not exceed 15 characters',
      })
      .superRefine((value, ctx) => {
        if (!/[A-Z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one uppercase letter',
          });
        }
        if (!/[a-z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one lowercase letter',
          });
        }
        if (!/[0-9]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one numeric digit',
          });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one special character',
          });
        }
      }),
    confirmPassword: z.string().min(1, {
      error: 'Confirm password is required',
    }),
    privacyConsent: z.boolean().refine((val) => val === true, {
      error: 'You must agree to the terms & conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });

// Login Schema
export const LoginSchema = z.object({
  email: z.email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, {
    error: 'Password is required',
  }),
});

// Reset Schema
export const ResetSchema = z.object({
  email: z.email('Invalid email address'),
});

// New Password Schema
export const UpdatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, {
        error: 'Password must be at least 8 characters long',
      })
      .max(20, {
        error: 'Password must not exceed 20 characters',
      })
      .superRefine((value, ctx) => {
        if (!/[A-Z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one uppercase letter',
          });
        }
        if (!/[a-z]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one lowercase letter',
          });
        }
        if (!/[0-9]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one numeric digit',
          });
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          ctx.addIssue({
            code: 'custom',
            message: 'Password should have at least one special character',
          });
        }
      }),
    confirmPassword: z.string().min(1, {
      error: 'Confirm password is required',
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  });

// Onboarding Form Schema
// Phone Verify Schema
export const PhoneVerifySchema = z.object({
  phone: z.string().refine((val) => isPhoneNumberValid(val), {
    error:
      'Invalid phone number. Please provide a valid number with the country code.',
  }),
});

// OTP Schema
export const OTPSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers')
    .refine((val) => val !== '', {
      error: 'OTP cannot be empty',
    }),
});

// GYM Details Schema
export const GymDetailsSchema = z.object({
  gymName: z
    .string()
    .min(1, 'Gym name is required')
    .max(100, 'Gym name should not exceed 100 characters')
    .trim(),

  profilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .optional(),

  buildingName: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 should not exceed 200 characters')
    .trim(),

  // Address Line 2 is optional, apply max before optional
  city: z
    .string()
    .max(200, 'Address Line 2 should not exceed 200 characters')
    .optional(),

  primaryPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Enter a valid primary phone number with country code'
    )
    .min(1, 'Primary phone number is required'),

  email: z
    .email('Enter a valid email address')
    .min(1, 'Email address is required')
    .max(150, 'Email address should not exceed 150 characters'),

  websiteLink: z
    .url('Enter a valid website URL')
    .max(255, 'Website URL cannot exceed 255 characters')
    .optional(),

  facebookPageLink: z
    .url('Enter a valid Facebook page URL')
    .max(255, 'Facebook page URL cannot exceed 255 characters')
    .optional(),

  instagramLink: z
    .url('Enter a valid Instagram URL')
    .max(255, 'Instagram URL cannot exceed 255 characters')
    .optional(),
});

// Create GYM Schema
export const CreateGymSchema = z.object({
  GymName: z
    .string()
    .min(1, 'Gym name is required.')
    .max(100, 'Gym name must not exceed 100 characters.'),
  Location: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  ContactNumber1: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Primary phone number must be a valid phone number.'
    ),
  ContactNumber2: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Secondary phone number must be a valid phone number.'
    )
    .optional()
    .or(z.literal('')),
  Email: z.email('Gym email must be a valid email address.'),
  ProfilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
      error: 'File size must be less than 5MB',
    })
    .optional(),
  socialLinks: z
    .array(
      z.object({
        url: z.string().optional(),
      })
    )
    .optional(),
});

// Trainer Form Schema
export const TrainerFormSchema = z.object({
  trainers: z
    .array(
      z.object({
        email: z.email('Enter a valid email'),
      })
    )
    .optional(),
});

export const DatePickerSchema = z.object({
  dateOfBirth: z.date({
    error: (issue) =>
      issue.input === undefined ? undefined : 'Invalid date format',
  }),
});

export const AddForm = z.object({
  memberName: z
    .string()
    .min(1, 'Member name is required')
    .max(100, 'Member name should not exceed 50 characters')
    .trim(),
  profilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .optional(),
  email: z
    .email('Enter a valid email address')
    .min(1, 'Email address is required')
    .max(150, 'Email address should not exceed 150 characters'),
  primaryPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Enter a valid primary phone number with country code'
    )
    .min(1, 'Primary phone number is required'),
  dob: z.string().min(1, 'DOB is required'),
  gender: z.string().min(1, 'Gender is required'),
  package: z.string().min(1, 'Package is required'),
  height: z.string().min(1, 'Height is required'),
  weight: z.string().min(1, 'Weight is required'),
  feeStatus: z.string().min(1, 'FeeStatus is required'),
  amountPaid: z.string().min(1, 'AmountPaid is required'),
  doj: z.string().min(1, 'DOJ is required'),
  workoutPlan: z.string().min(1, 'WorkoutPlan is required'),
  personalTrainer: z.string().min(1, 'peronalTrainer is required'),
  bloodgroup: z.string().min(1, 'BloodGroup is required'),
  addressLine1: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 should not exceed 200 characters')
    .trim(),
  addressLine2: z
    .string()
    .max(200, 'Address Line 2 should not exceed 200 characters')
    .optional(),
});

export const AddUserForm = z.object({
  memberName: z
    .string()
    .min(1, 'Member name is required')
    .max(100, 'Member name should not exceed 50 characters')
    .trim(),
  profilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .optional(),
  email: z
    .email('Enter a valid email address')
    .min(1, 'Email address is required')
    .max(150, 'Email address should not exceed 150 characters'),
  primaryPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Enter a valid primary phone number with country code'
    )
    .min(1, 'Primary phone number is required'),
  designation: z.string().min(1, 'Designation is required'),
  dob: z.string().min(1, 'DOB is required'),
  gender: z.string().min(1, 'Gender is required'),
  doj: z.string().min(1, 'DOJ is required'),
  feeStatus: z.string().min(1, 'FeeStatus is required'),
  amountPaid: z.string().min(1, 'AmountPaid is required'),
  addressLine1: z
    .string()
    .min(1, 'Address Line 1 is required')
    .max(200, 'Address Line 1 should not exceed 200 characters')
    .trim(),
  addressLine2: z
    .string()
    .max(200, 'Address Line 2 should not exceed 200 characters')
    .optional(),
});

export const EditDetailsForm = z.object({
  packageType: z.string().min(1, 'PackageType is required'),
  paidAmount: z.string().min(1, 'AmountPaid is required'),
});

export const createMemberSchema = z.object({
  profilePicture: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'Profile picture must be a file.',
    })
    .refine((file) => file === null || file.size <= 5 * 1024 * 1024, {
      error: 'File size must be less than 5MB',
    })
    .optional(),
  name: z.string().min(1, 'Member name is required'),
  dob: z.iso.datetime('Please select a valid Date of Birth.'),
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
  email: z.email('Invalid email format'),
  height: z.string().min(1, 'Height is required'),
  weight: z.string().min(1, 'Weight is required'),
  personalTrainer: z.union([z.string(), z.number()]),
  address: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  amountPaid: z.string().min(0, 'Amount paid must be a positive number'),
  workoutPlanId: z.string().min(1, 'Workout plan selection is required'),
  modeOfPayment: z.string().min(1, 'Payment method is required'),
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
  idType: z.string().min(1, 'ID type is required'),
  idNumber: z
    .string()
    .min(1, 'ID number is required')
    .max(20, 'ID number must not exceed 20 characters'),
  idCopyPath: z
    .custom<File | null>((value) => value instanceof File || value === null, {
      error: 'ID copy must be a file.',
    })
    .refine((file) => file !== null, {
      error: 'ID document is required',
    })
    .refine((file) => file === null || file.size <= 4 * 1024 * 1024, {
      error: 'File size must be less than 4MB',
    }),
  fitnessGoal: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^\+?[1-9]\d{1,14}$/, 'Phone number must be valid'),
  emergencyContactRelation: z.string().min(1, 'Relation is required'),
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
  Email: z.email({
    error: 'Please enter a valid email address.',
  }),
  Phone: z.string().min(10, {
    error: 'Phone number must be at least 10 digits.',
  }),
  Dob: z.iso.datetime('Please select a valid Date of Birth.'),
  Doj: z.iso.datetime('Please select a valid Date of Joining.'),
  Certification: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  Gender: z.string().min(1, 'Gender selection is required'),
  AddressLine: z
    .string()
    .min(1, 'Address is required.')
    .max(250, 'Address must not exceed 250 characters.'),
  BloodGroup: z.string().min(1, 'Blood group selection is required'),
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
  Email: z.email({
    error: 'Please enter a valid email address.',
  }),
  Phone: z.string().min(10, {
    error: 'Phone number must be at least 10 digits.',
  }),
  Dob: z.iso.datetime('Please select a valid Date of Birth.'),
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
        url: z.url(),
      })
    )
    .optional(),
});

export const dayBufferSchema = z.object({
  fee_buffer_amount: z.string().min(1, 'buffer amount is required'),
  fee_buffer_days: z.string().min(1, 'buffer day is required'),
  plan: z.string().min(1, 'plan selection is required'),
});

export const messagingTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  category: z.enum(['payment', 'reminder', 'notification', 'general']),
  channel: z.literal('whatsapp'),
  content: z.string().min(1, 'Message content is required'),
});

// Automation schemas
export const automationTimingSchema = z.object({
  id: z.string(),
  direction: z.enum(['before', 'after']),
  days: z.number().min(0),
  sendAt: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  channels: z
    .array(z.enum(['chat', 'whatsapp', 'sms']))
    .min(1, 'At least one channel is required'),
  templateId: z.string().min(1, 'Template is required'),
});

export const automationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  eventType: z.enum([
    'payment_advance',
    'payment_due',
    'payment_grace',
    'payment_failed',
    'payment_received',
    'class_reminder',
    'birthday',
    'anniversary',
    'achievement',
  ]),
  enabled: z.boolean(),
  timings: z
    .array(automationTimingSchema)
    .min(1, 'At least one timing is required'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createAutomationSchema = automationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateAutomationSchema = automationSchema.partial().omit({
  id: true,
  createdAt: true,
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
