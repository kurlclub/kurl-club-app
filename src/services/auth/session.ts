'use server';

import { cookies } from 'next/headers';

/**
 * Creates a session by storing the idToken in an HTTP-only cookie.
 *
 * @param idToken - The idToken to be stored in the cookie.
 *
 * Notes:
 * - The cookie is set with security options such as `httpOnly` and `sameSite`
 *   to protect it from client-side access and cross-site attacks.
 * - The cookie will expire in 30 days.
 */
export async function createSession(idToken: string) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set('idToken', idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

// Store Gym Branch Details in a Secure Cookie
export async function storeGymBranch(gymBranch: {
  gymId: number;
  gymName: string;
  gymLocation: string;
}) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const cookieStore = await cookies();

  cookieStore.set('gymBranch', JSON.stringify(gymBranch), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Retrieves the idToken stored in cookies.
 *
 * @returns The idToken if it exists, or `null` if not found.
 *
 */
export async function getSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('idToken')?.value;

  if (!token) {
    console.error('Failed to get idToken.');
    return null;
  }

  return token || null;
}

/**
 * Deletes the session by removing the idToken cookie.
 *
 * Notes:
 * - This function effectively logs the user out by clearing the token
 *   that is required for authentication.
 * - Ensures the `idToken` cookie is completely removed from the client.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('idToken');
  cookieStore.delete('gymBranch');
}
