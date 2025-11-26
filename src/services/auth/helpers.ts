import { applyActionCode, getAuth } from 'firebase/auth';

import { api } from '@/lib/api';
import { FirebaseResponse, UserRequest } from '@/types/user';

export const extractUserDetails = (response: FirebaseResponse): UserRequest => {
  const { uid, email, emailVerified, providerData } = response;

  if (!uid || !email) {
    throw new Error('Invalid Firebase response: UID and Email are required.');
  }

  const { phoneNumber = null, photoURL = null } = providerData?.[0] || {};

  return {
    uid,
    email,
    emailVerified,
    role: 'Admin',
    phoneNumber,
    photoURL,
  };
};

// CreateUser function
export const createUser = async (userData: UserRequest): Promise<void> => {
  try {
    await api.post<void>('/Auth/CreateUser', userData);
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// UpdateUser utility function
export const updateUser = async (
  userData: Partial<UserRequest>
): Promise<void> => {
  if (!userData.uid) {
    throw new Error('UID is required to update user');
  }

  try {
    await api.put<void>('/Auth/UpdateUser', userData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const confirmEmailVerification = async (
  oobCode: string
): Promise<{ success?: string; error?: string; uid?: string }> => {
  const auth = getAuth();

  try {
    await applyActionCode(auth, oobCode);

    // Reload the user state to get updated details
    await auth.currentUser?.reload();

    const user = auth.currentUser;

    if (!user) {
      return { error: 'Failed to retrieve the authenticated user.' };
    }

    return {
      success: 'Email verified successfully.',
      uid: user.uid,
    };
  } catch (error) {
    console.error('Error verifying email:', error);
    return {
      error: 'Invalid or expired verification link.',
    };
  }
};
