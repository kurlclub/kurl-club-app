import React from 'react';

type InfoBannerVariant = 'info' | 'warning' | 'success' | 'error';

interface InfoBannerProps {
  variant?: InfoBannerVariant;
  icon?: string;
  title?: string;
  message: string;
}

const variantStyles: Record<InfoBannerVariant, string> = {
  info: 'bg-primary-green-500/10 border-primary-green-500/20 text-gray-300',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  success: 'bg-green-500/10 border-green-500/20 text-green-400',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
};

export const InfoBanner: React.FC<InfoBannerProps> = ({
  variant = 'info',
  icon,
  title,
  message,
}) => {
  return (
    <div className={`p-2 border rounded-md ${variantStyles[variant]}`}>
      <p className="text-xs">
        {icon && <span>{icon} </span>}
        {title && <strong>{title}</strong>}
        {title && ' '}
        {message}
      </p>
    </div>
  );
};
