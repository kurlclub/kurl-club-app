'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';

import { AuthProvider } from '@/providers/auth-provider';
import { DialogProvider } from '@/providers/dialog-context';
import { GymBranchProvider } from '@/providers/gym-branch-provider';
import { QueryProvider } from '@/providers/query-provider';
import { SubscriptionProvider } from '@/providers/subscription-provider';
import { ThemeProvider } from '@/providers/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const appTree = (
    <QueryProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <GymBranchProvider>
            <DialogProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <Toaster richColors position="top-right" />
                {children}
              </ThemeProvider>
            </DialogProvider>
          </GymBranchProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryProvider>
  );

  if (!googleClientId) {
    return appTree;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {appTree}
    </GoogleOAuthProvider>
  );
}
