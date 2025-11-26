'use server';

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { z } from 'zod/v4';

import { auth } from '@/lib/firebase';
import { RegisterSchema } from '@/schemas';
import { createUser, extractUserDetails } from '@/services/auth/helpers';

export const registerUser = async (values: z.infer<typeof RegisterSchema>) => {
  // Validate input fields
  const validationResult = RegisterSchema.safeParse(values);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((err) => err.message)
      .join(', ');
    return { error: errorMessages };
  }

  const { email, password } = validationResult.data;

  try {
    // Firebase authentication: create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Extract user details and add custom application roles
    const userDetails = extractUserDetails({
      ...user,
      email: user.email as string,
    });
    userDetails.role = 'Admin';

    // Create user in your application system
    await createUser(userDetails);

    // Send email verification
    await sendEmailVerification(user);

    return {
      success:
        'Registration successful! Please check your email for verification.',
    };
  } catch (error) {
    console.error('Error during registration:', error);

    // Handle Firebase errors or unexpected exceptions
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during registration.';
    return { error: errorMessage };
  }
};
