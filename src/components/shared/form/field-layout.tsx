import React from 'react';

export const FieldRow = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-between gap-3 flex-wrap sm:flex-nowrap">
    {children}
  </div>
);

export const FieldColumn = ({
  children,
  auto = false,
}: {
  children: React.ReactNode;
  auto?: boolean;
}) => (
  <div className={`w-full ${auto ? 'sm:w-full' : 'sm:w-1/2'}`}>{children}</div>
);
