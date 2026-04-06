'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from 'react';

import {
  type CredentialResponse,
  GoogleLogin,
  type PromptMomentNotification,
} from '@react-oauth/google';
import { toast } from 'sonner';

import {
  clearGoogleOneTapSuppression,
  isGoogleOneTapSuppressed,
} from '@/lib/google-one-tap';
import { useAuth } from '@/providers/auth-provider';

function GoogleColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M47.532 24.552c0-1.636-.132-3.196-.388-4.692H24v9.01h13.196c-.58 3.021-2.304 5.579-4.892 7.294v6.044h7.912c4.628-4.26 7.316-10.54 7.316-17.656z"
        fill="#4285F4"
      />
      <path
        d="M24 48c6.624 0 12.184-2.196 16.244-5.792l-7.912-6.044c-2.196 1.476-4.996 2.348-8.332 2.348-6.404 0-11.836-4.324-13.78-10.14H1.98v6.244C6.024 42.628 14.412 48 24 48z"
        fill="#34A853"
      />
      <path
        d="M10.22 28.372A14.908 14.908 0 0 1 9.428 24c0-1.516.26-2.988.792-4.372v-6.244H1.98A23.99 23.99 0 0 0 0 24c0 3.876.928 7.54 2.58 10.796l7.64-6.424z"
        fill="#FBBC05"
      />
      <path
        d="M24 9.488c3.608 0 6.844 1.24 9.392 3.676l7.024-7.024C36.176 2.196 30.62 0 24 0 14.412 0 6.024 5.372 1.98 13.384l8.24 6.244C12.164 13.812 17.596 9.488 24 9.488z"
        fill="#EA4335"
      />
    </svg>
  );
}

const getPromptMomentDetails = (notification: PromptMomentNotification) => {
  try {
    if (notification.isDisplayed()) {
      return { moment: 'displayed' };
    }

    if (notification.isNotDisplayed()) {
      return {
        moment: 'not_displayed',
        reason: notification.getNotDisplayedReason(),
      };
    }

    if (notification.isSkippedMoment()) {
      return {
        moment: 'skipped',
        reason: notification.getSkippedReason(),
      };
    }

    if (notification.isDismissedMoment()) {
      return {
        moment: 'dismissed',
        reason: notification.getDismissedReason(),
      };
    }

    return { moment: notification.getMomentType() };
  } catch (error) {
    return {
      moment: 'unknown',
      reason: error instanceof Error ? error.message : 'unknown_error',
    };
  }
};

interface GoogleSignInSectionProps {
  disabled?: boolean;
}

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;
const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);

export function GoogleSignInSection({
  disabled = false,
}: GoogleSignInSectionProps) {
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [googleButtonWidth, setGoogleButtonWidth] = useState<number | null>(
    null
  );
  const { isLoading, loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const buttonShellRef = useRef<HTMLDivElement | null>(null);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );
  const isGoogleLoginEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  );
  const isLocalhostFedCmExplicitlyEnabled =
    process.env.NEXT_PUBLIC_ENABLE_LOCALHOST_FEDCM === 'true';
  const isLoginRoute = pathname === '/auth/login';
  const isInteractionDisabled = disabled || isGooglePending;
  const shouldSuppressPromptThisVisit =
    isHydrated && isGoogleOneTapSuppressed();
  const isLocalhostOrigin =
    isHydrated &&
    typeof window !== 'undefined' &&
    LOCALHOST_HOSTNAMES.has(window.location.hostname);
  const shouldDisableFedCmForLocalhost =
    isLocalhostOrigin && !isLocalhostFedCmExplicitlyEnabled;

  useEffect(() => {
    if (!shouldSuppressPromptThisVisit) return;
    clearGoogleOneTapSuppression();
  }, [shouldSuppressPromptThisVisit]);

  useEffect(() => {
    if (!isHydrated || !buttonShellRef.current) return;

    const buttonShell = buttonShellRef.current;

    const syncWidth = () => {
      const nextWidth = Math.max(
        Math.round(buttonShell.getBoundingClientRect().width),
        240
      );

      setGoogleButtonWidth((currentWidth) =>
        currentWidth === nextWidth ? currentWidth : nextWidth
      );
    };

    const frameId = window.requestAnimationFrame(syncWidth);
    const resizeObserver = new ResizeObserver(() => {
      syncWidth();
    });

    resizeObserver.observe(buttonShell);

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [isHydrated]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast.error('Google login failed: no credential received');
      return;
    }

    startGoogleTransition(async () => {
      const result = await loginWithGoogle(credential);
      if (result.success) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Google login failed');
      }
    });
  };

  const handlePromptMoment = (notification: PromptMomentNotification) => {
    if (process.env.NODE_ENV === 'production') return;

    console.debug('[Google One Tap]', getPromptMomentDetails(notification));
  };

  const shouldEnableFedCmPrompt =
    isGoogleLoginEnabled &&
    isHydrated &&
    !isInteractionDisabled &&
    !isLoading &&
    !user &&
    isLoginRoute &&
    !shouldDisableFedCmForLocalhost &&
    !shouldSuppressPromptThisVisit;

  if (!isGoogleLoginEnabled) {
    return null;
  }

  return (
    <>
      <div className="relative my-4 flex items-center">
        <div className="flex-1 border-t border-muted" />
        <span className="mx-3 text-xs text-muted-foreground">or</span>
        <div className="flex-1 border-t border-muted" />
      </div>

      <div
        ref={buttonShellRef}
        className={`group relative w-full overflow-hidden rounded-xl ${
          isInteractionDisabled ? 'opacity-60' : ''
        }`}
        aria-disabled={isInteractionDisabled}
      >
        <div className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.25 text-sm font-medium text-white/90 transition-colors group-hover:border-white/20 group-hover:bg-white/10 group-active:bg-white/15">
          <GoogleColorIcon />
          {isGooglePending
            ? 'Signing in with Google...'
            : 'Continue with Google'}
        </div>

        <div
          className={`absolute inset-0 overflow-hidden opacity-0 [&>div]:h-full [&>div]:w-full [&_iframe]:h-full ${
            isInteractionDisabled ? 'pointer-events-none' : ''
          }`}
        >
          {isHydrated ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              useOneTap={shouldEnableFedCmPrompt}
              use_fedcm_for_prompt={shouldEnableFedCmPrompt}
              cancel_on_tap_outside={shouldEnableFedCmPrompt}
              auto_select={false}
              promptMomentNotification={handlePromptMoment}
              text="continue_with"
              width={googleButtonWidth ? String(googleButtonWidth) : undefined}
              containerProps={{
                className: 'h-full w-full',
              }}
            />
          ) : (
            <div className="h-full w-full" />
          )}
        </div>
      </div>
    </>
  );
}
