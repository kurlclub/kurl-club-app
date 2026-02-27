'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatDistanceToNow } from 'date-fns';
import { Globe, Key, MapPin, Monitor, Smartphone, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useForgotPassword,
  useResetPassword,
  useVerifyResetOtp,
} from '@/hooks/use-password-reset';
import { useAuth } from '@/providers/auth-provider';
import {
  type Session,
  getSessions,
  revokeAllOtherSessions,
  revokeSession,
} from '@/services/auth/sessions';

type PasswordStep = 'idle' | 'email' | 'otp' | 'password';

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const newPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type EmailFormData = z.infer<typeof emailSchema>;
type OtpFormData = z.infer<typeof otpSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

export function SecurityTab() {
  const { user } = useAuth();
  const [passwordStep, setPasswordStep] = useState<PasswordStep>('idle');
  const [savedEmail, setSavedEmail] = useState('');
  const [savedOtp, setSavedOtp] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.userEmail ?? '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const sendOtpMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyResetOtp();
  const resetPasswordMutation = useResetPassword();

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const data = await getSessions();
        setSessions(data.sessions);
        setTotalSessions(data.totalSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
        toast.error('Failed to load active sessions');
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setSecondsLeft(null);
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return null;
        if (s <= 1) {
          clearInterval(id);
          return null;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  const handleStartChangePassword = () => {
    emailForm.reset({ email: user?.userEmail ?? '' });
    setPasswordStep('email');
  };

  const handleCancelChangePassword = () => {
    setPasswordStep('idle');
    setSavedEmail('');
    setSavedOtp('');
    setSecondsLeft(null);
    emailForm.reset();
    otpForm.reset();
    newPasswordForm.reset();
  };

  const onEmailSubmit = (data: EmailFormData) => {
    setSavedEmail(data.email);
    sendOtpMutation.mutate(data.email, {
      onSuccess: () => {
        toast.success('OTP sent to your email!');
        setPasswordStep('otp');
        setSecondsLeft(60);
      },
    });
  };

  const onOtpSubmit = (data: OtpFormData) => {
    if (!savedEmail) {
      toast.error('Email not found. Please start over.');
      setPasswordStep('email');
      return;
    }
    setSavedOtp(data.otp);
    verifyOtpMutation.mutate(
      { email: savedEmail, otp: data.otp },
      {
        onSuccess: () => {
          toast.success('OTP verified!');
          setPasswordStep('password');
        },
      }
    );
  };

  const onNewPasswordSubmit = (data: NewPasswordFormData) => {
    if (!savedEmail || !savedOtp) {
      toast.error('Session expired. Please start over.');
      setPasswordStep('email');
      return;
    }
    resetPasswordMutation.mutate(
      { email: savedEmail, otp: savedOtp, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success('Password changed successfully!');
          handleCancelChangePassword();
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (!savedEmail) return;
    sendOtpMutation.mutate(savedEmail, {
      onSuccess: () => {
        toast.success('OTP resent to your email!');
        setSecondsLeft(60);
        otpForm.reset();
      },
    });
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      // Refresh sessions after revoking
      const data = await getSessions();
      setSessions(data.sessions);
      setTotalSessions(data.totalSessions);
      toast.success('Session revoked successfully');
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await revokeAllOtherSessions();
      // Refresh sessions after revoking all others
      const data = await getSessions();
      setSessions(data.sessions);
      setTotalSessions(data.totalSessions);
      toast.success('All other sessions revoked successfully');
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error('Failed to revoke other sessions');
    }
  };

  const getDeviceIcon = (deviceType: string, platform: string) => {
    if (
      deviceType === 'mobile' ||
      platform.toLowerCase().includes('ios') ||
      platform.toLowerCase().includes('android')
    ) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatLastActivity = (lastActivityAt: string) => {
    try {
      return formatDistanceToNow(new Date(lastActivityAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
                {passwordStep === 'idle'
                  ? 'Change your account password'
                  : passwordStep === 'email'
                    ? 'Enter your email to receive a one-time password'
                    : passwordStep === 'otp'
                      ? `Enter the 6-digit code sent to ${savedEmail}`
                      : 'Set your new password'}
              </CardDescription>
            </div>
            {passwordStep === 'idle' && (
              <Button onClick={handleStartChangePassword} variant="outline">
                Change Password
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Step: Email */}
        {passwordStep === 'email' && (
          <CardContent className="space-y-4">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                className="space-y-4"
              >
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={emailForm.control}
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelChangePassword}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sendOtpMutation.isPending}>
                    {sendOtpMutation.isPending ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}

        {/* Step: OTP */}
        {passwordStep === 'otp' && (
          <CardContent className="space-y-4">
            <Form {...otpForm}>
              <form
                onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>OTP Code</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup className="gap-2 sm:gap-2.5">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="rounded-md border border-gray-300 dark:border-secondary-blue-400 dark:bg-secondary-blue-600 h-12 w-12"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-sm text-muted-foreground">
                  {secondsLeft !== null ? (
                    <>
                      Resend OTP in{' '}
                      <span className="font-medium">{secondsLeft}s</span>
                    </>
                  ) : (
                    <>
                      Didn&apos;t receive it?{' '}
                      <button
                        type="button"
                        className="text-primary underline"
                        onClick={handleResendOtp}
                        disabled={sendOtpMutation.isPending}
                      >
                        Resend OTP
                      </button>
                    </>
                  )}
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelChangePassword}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verifyOtpMutation.isPending}>
                    {verifyOtpMutation.isPending
                      ? 'Verifying...'
                      : 'Verify OTP'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}

        {/* Step: New Password */}
        {passwordStep === 'password' && (
          <CardContent className="space-y-4">
            <Form {...newPasswordForm}>
              <form
                onSubmit={newPasswordForm.handleSubmit(onNewPasswordSubmit)}
                className="space-y-4"
              >
                <KFormField
                  fieldType={KFormFieldType.PASSWORD}
                  control={newPasswordForm.control}
                  name="newPassword"
                  label="New Password"
                />
                <KFormField
                  fieldType={KFormFieldType.PASSWORD}
                  control={newPasswordForm.control}
                  name="confirmPassword"
                  label="Confirm New Password"
                />
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancelChangePassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending
                      ? 'Saving...'
                      : 'Save Password'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
                {!isLoadingSessions && (
                  <Badge variant="secondary" className="ml-2">
                    {totalSessions}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
                Manage devices where you&apos;re currently logged in
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoadingSessions ? (
              // Loading state
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-50 dark:bg-secondary-blue-600 rounded-lg border border-gray-200 dark:border-secondary-blue-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-5 w-5 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No active sessions found
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 dark:bg-secondary-blue-600 rounded-lg border border-gray-200 dark:border-secondary-blue-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-gray-600 dark:text-secondary-blue-200 mt-0.5">
                        {getDeviceIcon(session.deviceType, session.platform)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {session.deviceName !== 'Unknown on Unknown'
                              ? session.deviceName
                              : `${session.browser || 'Unknown Browser'} on ${session.platform || 'Unknown'}`}
                          </p>
                          {session.isCurrent && (
                            <Badge
                              variant="secondary"
                              className="bg-primary-green-500/20 text-primary-green-500 text-xs px-2 py-0.5"
                            >
                              Current
                            </Badge>
                          )}
                          {session.isOnline && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-500/20 text-blue-500 text-xs px-2 py-0.5"
                            >
                              Online
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-secondary-blue-200 mt-1">
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{session.location}</span>
                            </div>
                          )}
                          <span>
                            Last active{' '}
                            {formatLastActivity(session.lastActivityAt)}
                          </span>
                          {session.daysActive > 0 && (
                            <span>• {session.daysActive} days active</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleRevokeSession(session.sessionId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {!isLoadingSessions && sessions.length > 1 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={handleRevokeAllOtherSessions}
            >
              Revoke All Other Sessions
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
