import * as React from 'react';

import { ChevronRightIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
}

export function Breadcrumb({
  items,
  separator = <ChevronRightIcon className="w-3 h-3" />,
  maxItems = 5,
}: BreadcrumbProps) {
  const renderItems = () => {
    if (items.length <= maxItems) {
      return items.map((item, index) => (
        <React.Fragment key={index}>
          <BreadcrumbItem>
            {item.href ? (
              <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {index < items.length - 1 && (
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          )}
        </React.Fragment>
      ));
    } else {
      return (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink href={items[0].href}>
              {items[0].label}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={items[items.length - 1].href}>
              {items[items.length - 1].label}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <nav aria-label="breadcrumb">
      <ol className="flex items-center space-x-2">{renderItems()}</ol>
    </nav>
  );
}

const BreadcrumbItem = ({ children }: { children: React.ReactNode }) => (
  <li className="inline-flex items-center ml-0!">{children}</li>
);

const BreadcrumbLink = ({
  href,
  children,
}: {
  href: string | undefined;
  children: React.ReactNode;
}) => (
  <a
    href={href ?? '#'}
    className="text-primary-blue-200 font-normal text-sm leading-normal hover:underline"
  >
    {children}
  </a>
);

const BreadcrumbPage = ({ children }: { children: React.ReactNode }) => (
  <span className="text-primary-blue-200 font-normal text-sm leading-normal ml-1">
    {children}
  </span>
);

const BreadcrumbSeparator = ({ children }: { children: React.ReactNode }) => (
  <li className="text-primary-blue-200 h-3 w-3 ml-1!">{children}</li>
);

const BreadcrumbEllipsis = () => <li className="text-gray-400">...</li>;
