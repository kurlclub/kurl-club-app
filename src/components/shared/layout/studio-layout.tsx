import { ReactNode } from 'react';

import { KTabs, TabItem } from '@/components/shared/form/k-tabs';

interface StudioLayoutProps {
  title: string;
  description?: string;
  headerActions?: ReactNode;
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: ReactNode;
  maxContentWidth?: 'default' | 'narrow' | 'wide';
}

export const StudioLayout = ({
  title,
  description,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  children,
  maxContentWidth = 'default',
}: StudioLayoutProps) => {
  const getContentConstraints = () => {
    switch (maxContentWidth) {
      case 'narrow':
        return 'max-w-4xl mx-auto';
      case 'wide':
        return 'w-full';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="bg-background-dark h-full w-full min-w-0">
      <div className="w-full min-w-0 px-4 py-5 md:p-8">
        <div className="flex flex-col gap-6 w-full min-w-0">
          {/* Page header */}
          <div className="flex items-center justify-between flex-wrap gap-4 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold truncate">{title}</h2>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-2 shrink-0">{headerActions}</div>
            )}
          </div>

          {/* Tabs */}
          {tabs?.length ? (
            <div className="w-full min-w-0">
              <KTabs
                items={tabs}
                variant="underline"
                value={activeTab || ''}
                onTabChange={onTabChange || (() => {})}
              />
            </div>
          ) : null}

          {/* Content */}
          <div
            className={`flex-1 min-h-0 w-full min-w-0 ${getContentConstraints()}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
