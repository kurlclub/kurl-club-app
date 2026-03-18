import type { Metadata } from 'next';

import RegisterForm from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Register for your KurlClub Admin account to manage your gym',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
