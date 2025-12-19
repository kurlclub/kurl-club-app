'use client';

import Link from 'next/link';

// AuthHeader Component
interface AuthHeaderProps {
  authTitle: string;
  authDesc: string;
}

export const AuthHeader = ({ authTitle, authDesc }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col gap-2.5 mb-6 sm:mb-8">
      <h5 className="text-white text-[32px] font-semibold leading-normal">
        {authTitle}
      </h5>
      <p className="text-primary-blue-50 text-[15px] font-normal leading-normal">
        {authDesc}
      </p>
    </div>
  );
};

// AuthFooter Component
interface AuthFooterProps {
  footerDesc?: string;
  footerLink?: string;
  isLogin?: boolean;
  onFooterClick?: () => void;
}

export const AuthFooter = ({
  footerDesc,
  footerLink,
  isLogin,
  onFooterClick,
}: AuthFooterProps) => {
  if (!footerLink && !onFooterClick) return null;

  return (
    <div className="flex items-center justify-center w-full gap-2 mt-6">
      <h6 className="text-sm font-normal leading-normal text-white">
        {footerDesc}
      </h6>
      {onFooterClick ? (
        <button
          type="button"
          onClick={onFooterClick}
          className="text-sm font-normal leading-normal underline cursor-pointer text-semantic-blue-500 underline-offset-2 hover:no-underline k-transition"
        >
          {isLogin ? 'Login as Trainer' : 'Login as Admin'}
        </button>
      ) : (
        <Link
          className="text-sm font-normal leading-normal underline cursor-pointer text-semantic-blue-500 underline-offset-2 hover:no-underline k-transition"
          href={footerLink!}
        >
          {isLogin ? 'Login as Trainer' : 'Login as Admin'}
        </Link>
      )}
    </div>
  );
};
