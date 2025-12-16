import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  forgotPassword,
  resetPassword,
  verifyResetOtp,
} from '@/services/auth/auth';

export function useForgotPassword() {
  return useMutation({
    mutationFn: forgotPassword,
    onError: () => {
      toast.error('Failed to send OTP. Please try again.');
    },
  });
}

export function useVerifyResetOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyResetOtp(email, otp),
    onError: () => {
      toast.error('Invalid OTP. Please try again.');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      email,
      otp,
      newPassword,
    }: {
      email: string;
      otp: string;
      newPassword: string;
    }) => resetPassword(email, otp, newPassword),
    onError: () => {
      toast.error('Failed to reset password. Please try again.');
    },
  });
}
