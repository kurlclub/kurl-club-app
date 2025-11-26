import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ message, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2
        className={`${sizeClasses[size]} mb-3 animate-spin text-primary-green-500`}
      />
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
}
