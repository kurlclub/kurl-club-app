'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Monitor, X } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod/v4';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const sessions = [
  {
    id: 1,
    device: 'Chrome on MacBook Pro',
    location: 'San Francisco, CA',
    lastActive: '2 minutes ago',
    current: true,
  },
  {
    id: 2,
    device: 'Safari on iPhone 14',
    location: 'San Francisco, CA',
    lastActive: '1 hour ago',
    current: false,
  },
  {
    id: 3,
    device: 'Chrome on Windows',
    location: 'New York, NY',
    lastActive: '2 days ago',
    current: false,
  },
];

export function SecurityTab() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    // TODO: Implement API call to change password
    console.log('Changing password with data:', data);
    toast.success('Password changed successfully!');
    form.reset();
    setIsChangingPassword(false);
  };

  const handleRevokeSession = (sessionId: number) => {
    // TODO: Implement session revocation
    console.log('Revoking session with ID:', sessionId);
    toast.success('Session revoked successfully!');
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
                Last changed 30 days ago
              </CardDescription>
            </div>
            {!isChangingPassword && (
              <Button
                onClick={() => setIsChangingPassword(true)}
                variant="outline"
              >
                Change Password
              </Button>
            )}
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={form.control}
                name="currentPassword"
                label="Current Password"
              />
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={form.control}
                name="newPassword"
                label="New Password"
              />
              <KFormField
                fieldType={KFormFieldType.PASSWORD}
                control={form.control}
                name="confirmPassword"
                label="Confirm New Password"
              />
              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    form.reset();
                    setIsChangingPassword(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                  Update Password
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Active Sessions */}
      <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-secondary-blue-400 py-2">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-secondary-blue-200 text-[15px]">
            Manage devices where you&apos;re currently logged in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 dark:bg-secondary-blue-600 rounded-lg border border-gray-200 dark:border-secondary-blue-400"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Monitor className="h-5 w-5 text-gray-600 dark:text-secondary-blue-200 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {session.device}
                        </p>
                        {session.current && (
                          <span className="text-xs px-2 py-0.5 bg-primary-green-500/20 text-primary-green-500 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-secondary-blue-200 mt-1">
                        {session.location} • {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            Revoke All Other Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
