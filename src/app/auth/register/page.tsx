import type { Metadata } from 'next';

import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your KurlClub Admin account to start managing your gym',
};

const RegisterPage = () => {
  return <RegisterForm />;
};

export default RegisterPage;
