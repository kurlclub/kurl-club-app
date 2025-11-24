'use client';

import { StudioLayout } from '@/components/shared/layout';

export default function SessionPaymentsPage() {
  return (
    <StudioLayout
      title="Per Session Payments"
      description="Manage payments for session-based memberships"
    >
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Per Session Payments
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            This feature is coming soon. Track and manage payments for members
            on per-session billing plans.
          </p>
        </div>
      </div>
    </StudioLayout>
  );
}
