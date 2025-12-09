'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment } from 'react';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { UpdatePasswordForm } from '@/components/auth/update-pw-form';

const ActivateScreen = () => {
  const searchParams = useSearchParams();
  const action = searchParams.get('mode');

  if (!action) return <div>Loading...</div>;

  return (
    <Fragment>
      {action === 'verifyEmail' && <AuthWrapper verification />}
      {action === 'resetPassword' && <UpdatePasswordForm />}
      {!['verifyEmail', 'resetPassword'].includes(action) && (
        <div>Invalid action</div>
      )}
    </Fragment>
  );
};

export default ActivateScreen;
