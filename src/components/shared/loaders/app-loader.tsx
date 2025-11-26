'use client';

import Image from 'next/image';

export const AppLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="shadow-lg">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%203-1bUu3foSGcahraLSyANoyl4dlcVN2Z.png"
            alt="Loading"
            width={80}
            height={80}
            className="drop-shadow-[0_0_15px_rgba(190,255,0,0.3)]"
          />
        </div>
      </div>
    </div>
  );
};
