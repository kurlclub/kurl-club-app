'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function AuthBanner() {
  const pathname = usePathname();
  const isRegister = pathname?.startsWith('/auth/register');

  const src = isRegister
    ? '/assets/png/register-banner.png'
    : '/assets/png/login-banner.png';

  return (
    <Image
      src={src}
      alt={isRegister ? 'register-banner' : 'login-banner'}
      className="object-cover object-bottom-left w-full h-full rounded-xl"
      height={1000}
      width={1000}
      priority
    />
  );
}
