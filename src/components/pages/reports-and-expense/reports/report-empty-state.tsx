import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ReportEmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

const ReportEmptyState = ({
  title,
  description,
  icon,
  className,
  titleClassName,
  descriptionClassName,
}: ReportEmptyStateProps) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-primary-blue-400/40 bg-primary-blue-400/10 p-8 text-center flex flex-col justify-center items-center',
        className
      )}
    >
      {icon}
      <p
        className={cn(
          'text-lg font-semibold leading-tight text-white',
          titleClassName
        )}
      >
        {title}
      </p>
      {description ? (
        <p
          className={cn(
            'mt-1 text-sm leading-5 text-primary-blue-100',
            descriptionClassName
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
};

export default ReportEmptyState;
