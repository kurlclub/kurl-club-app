'use client';

import { SessionPaymentTab } from '@/components/pages/payments/per-session';
import { StudioLayout } from '@/components/shared/layout';
import { useGymBranch } from '@/providers/gym-branch-provider';

export default function SessionPaymentsPage() {
  const { gymBranch } = useGymBranch();

  if (!gymBranch?.gymId) {
    return (
      <StudioLayout
        title="Per Session Payments"
        description="Manage payments for session-based memberships"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Loading gym information...
            </p>
          </div>
        </div>
      </StudioLayout>
    );
  }

  return (
    <StudioLayout
      title="Per Session Payments"
      description="Manage payments for session-based memberships"
    >
      <SessionPaymentTab gymId={gymBranch.gymId} />
    </StudioLayout>
  );
}
