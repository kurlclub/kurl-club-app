'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import { z } from 'zod';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/providers/auth-provider';
import { loginSchema } from '@/schemas';

type LoginFormData = z.infer<typeof loginSchema>;

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

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const isGoogleLoginEnabled = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  );

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    startTransition(async () => {
      const result = await login(data.email, data.password);

      if (result.success) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    });
  };

  const onGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const credential = credentialResponse.credential;
    if (!credential) {
      toast.error('Google login failed: no credential received');
      return;
    }

    startTransition(async () => {
      const result = await loginWithGoogle(credential);
      if (result.success) {
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(result.error || 'Google login failed');
      }
    });
  };

  return (
    <AuthWrapper
      header={{
        title: 'Login',
        description: "Welcome back! Let's get started.",
      }}
      footer={{
        linkUrl: '/auth/register',
        linkText: 'Don’t have an account?',
        isLogin: true,
        linkBtnText: 'Register',
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
          <div className="flex flex-col gap-4 sm:gap-6">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              disabled={isPending}
              name="email"
              label="Email address"
              isLogin
            />
            <KFormField
              fieldType={KFormFieldType.PASSWORD}
              control={form.control}
              disabled={isPending}
              name="password"
              label="Password"
              isLogin
            />
          </div>
          <Button
            size="sm"
            variant="link"
            asChild
            className="px-1 font-normal flex justify-start my-3"
          >
            <Link href="/auth/reset">Forgot password?</Link>
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="px-3 py-4 h-11.5"
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
          {isGoogleLoginEnabled && (
            <>
              <div className="relative my-4 flex items-center">
                <div className="flex-1 border-t border-muted" />
                <span className="mx-3 text-xs text-muted-foreground">or</span>
                <div className="flex-1 border-t border-muted" />
              </div>
              <div className="group relative w-full overflow-hidden rounded-xl">
                <div className="pointer-events-none flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.25 text-sm font-medium text-white/90 transition-colors group-hover:border-white/20 group-hover:bg-white/10 group-active:bg-white/15">
                  <GoogleColorIcon />
                  Continue with Google
                </div>
                <div className="absolute inset-0 overflow-hidden opacity-0 [&>div]:h-full [&>div>div]:h-full [&_iframe]:h-full">
                  <GoogleLogin
                    onSuccess={onGoogleSuccess}
                    onError={() => toast.error('Google login failed')}
                    useOneTap={false}
                    width="99999"
                  />
                </div>
              </div>
            </>
          )}
        </form>
      </Form>
    </AuthWrapper>
  );
}
