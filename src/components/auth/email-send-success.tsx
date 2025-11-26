import { AuthWrapper } from '@/components/auth/auth-wrapper';

export const EmailSendSuccess = () => {
  return (
    <AuthWrapper>
      <div className="flex flex-col gap-7 text-center">
        <h4 className="text-white font-semibold text-[32px] leading-normal">
          Verify Email ✅
        </h4>
        <p className="text-xl font-medium leading-normal text-white">
          KurlClub has sent a mail to your account. Login by following the link
          there!
        </p>
      </div>
    </AuthWrapper>
  );
};
