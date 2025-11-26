'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { applyActionCode } from 'firebase/auth';
import { toast } from 'sonner';

import { auth } from '@/lib/firebase';

export const AuthVerify = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleVerification = useCallback(async () => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    if (mode !== 'verifyEmail' || !oobCode) {
      const errorMessage = 'Invalid or missing verification code!';
      setStatus('error');
      toast.error(errorMessage);
      return;
    }

    try {
      await applyActionCode(auth, oobCode);
      setStatus('success');
      toast.success('Email verified successfully! Redirecting to login...');
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred during email verification!';
      setStatus('error');
      toast.error(errorMessage);
    }
  }, [searchParams, router]);

  useEffect(() => {
    handleVerification();
  }, [handleVerification]);

  return (
    <div className="flex flex-col gap-7 text-center">
      <h4 className="text-white font-semibold text-[32px] leading-normal">
        {status === 'success' ? 'Email Verified ✅' : 'Verify Email...'}
      </h4>
      <p className="text-xl font-medium leading-normal text-white">
        {status === 'success'
          ? 'Your email has been successfully verified. Redirecting to login...'
          : status === 'error'
            ? 'Failed to verify your email. Please try again or contact support.'
            : 'KurlClub is verifying your email. Please wait...'}
      </p>
    </div>
  );
};
