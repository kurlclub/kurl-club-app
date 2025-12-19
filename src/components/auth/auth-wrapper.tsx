import { AuthFooter, AuthHeader } from '@/components/auth/auth-wrapper-helpers';

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
    onFooterClick?: () => void;
  };
}

export const AuthWrapper = ({
  children,
  header = {},
  footer = {},
}: AuthWrapperProps) => {
  const {
    linkUrl = '',
    linkText = '',
    isLogin = false,
    onFooterClick,
  } = footer;
  const { title = '', description = '' } = header;

  return (
    <div className="w-full max-w-full sm:max-w-[500px] md:max-w-[60%] md:min-w-[400px]">
      <AuthHeader authTitle={title} authDesc={description} />
      <div className="">{children}</div>
      {(linkUrl || onFooterClick) && (
        <AuthFooter
          footerLink={linkUrl}
          footerDesc={linkText}
          isLogin={isLogin}
          onFooterClick={onFooterClick}
        />
      )}
    </div>
  );
};
