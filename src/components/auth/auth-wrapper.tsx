import { AuthVerify } from '@/components/auth/auth-verify';
import { AuthFooter, AuthHeader } from '@/components/auth/auth-wrapper-helpers';
import { Social } from '@/components/auth/social';

interface AuthWrapperProps {
  children?: React.ReactNode;
  header?: {
    title?: string;
    description?: string;
  };
  footer?: {
    linkUrl?: string;
    linkText?: string;
    isLogin?: boolean;
  };
  socials?: boolean;
  verification?: boolean;
  onBackButtonClick?: () => void;
}

export const AuthWrapper = ({
  children,
  header = {},
  footer = {},
  socials,
  verification,
}: AuthWrapperProps) => {
  const { linkUrl = '', linkText = '', isLogin = false } = footer;
  const { title = '', description = '' } = header;

  return (
    <div className="w-full max-w-full sm:max-w-[500px] md:max-w-[60%] md:min-w-[400px]">
      {!verification ? (
        <>
          {/* header */}
          <AuthHeader authTitle={title} authDesc={description} />

          {/* body */}
          <div className="">{children}</div>

          {/* social section */}
          {socials && <Social isLogin={isLogin} />}

          {/* footer */}
          {linkUrl && (
            <AuthFooter
              footerLink={linkUrl}
              footerDesc={linkText}
              isLogin={isLogin}
            />
          )}
        </>
      ) : (
        // verification
        <AuthVerify />
      )}
    </div>
  );
};
