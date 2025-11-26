'use client';

import { useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import { AuthWrapper } from '@/components/auth/auth-wrapper';
import { UpdatePasswordForm } from '@/components/auth/update-pw-form';

const ActivateScreen = () => {
  const [action, setAction] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    setAction(mode as string);
  }, [searchParams]);

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
