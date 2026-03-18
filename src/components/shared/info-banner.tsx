import React from 'react';

type InfoBannerVariant = 'info' | 'warning' | 'success' | 'error';

interface InfoBannerProps {
  variant?: InfoBannerVariant;
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
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
  action,
}) => {
  return (
    <div
      className={`p-3 border rounded-md flex items-center justify-between gap-4 ${variantStyles[variant]}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="flex items-center">{icon}</span>}

        <p className="text-xs">
          {title && <strong>{title} </strong>}
          {message}
        </p>
      </div>

      {action}
    </div>
  );
};
