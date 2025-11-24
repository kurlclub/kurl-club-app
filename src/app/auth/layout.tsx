import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Secure login to KurlClub Admin - Gym Management System',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="grid w-full bg-background-dark h-screen grid-cols-1 gap-8 p-6 md:grid-cols-2 md:p-8">
      <span className="h-[calc(100vh-64px)] w-full hidden md:block">
        <Image
          src="/assets/png/login-banner.png"
          alt="login-banner"
          className="object-cover object-bottom-left w-full h-full rounded-xl"
          height={1000}
          width={1000}
          priority
        />
      </span>

      <div className="flex flex-col items-end justify-between w-full h-full gap-4">
        <span>
          <Image
            className="ml-auto w-fit"
            src="/assets/svg/logo-light.svg"
            alt="logo"
            height={1000}
            width={1000}
            priority
          />
        </span>

        <div className="flex items-center justify-center w-full h-full">
          {children}
        </div>
      </div>
    </main>
  );
}
