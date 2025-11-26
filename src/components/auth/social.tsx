'use client';

import { KApple, KGoogle } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';

interface SocialProps {
  isLogin?: boolean;
}

export const Social = ({ isLogin = false }: SocialProps) => {
  const actionText = isLogin ? 'Login' : 'Sign up';

  return (
    <div className="">
      {/* Divider with text */}
      <div className="flex items-center gap-4 mt-3">
        <span className="flex-1 h-px bg-linear-to-l from-primary-blue-400 via-primary-blue-400 to-transparent"></span>
        <p className="text-sm font-normal leading-normal text-center text-white">
          Or {actionText} with
        </p>
        <span className="flex-1 h-px bg-linear-to-l from-transparent via-primary-blue-400 to-primary-blue-400"></span>
      </div>

      {/* Social Buttons */}
      <div className="flex flex-col items-center w-full gap-3 mt-5 sm:flex-row">
        <Button
          variant="outline"
          className="w-full h-[46px] gap-2 py-2.5 font-normal"
        >
          <KGoogle />
          {actionText} with Google
        </Button>
        <Button
          variant="outline"
          className="w-full h-[46px] gap-2 py-2.5 font-normal"
        >
          <KApple />
          {actionText} with Apple ID
        </Button>
      </div>
    </div>
  );
};
