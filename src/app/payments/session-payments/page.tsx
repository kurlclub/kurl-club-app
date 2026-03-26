'use client';

import { SessionPaymentTab } from '@/components/pages/payments/per-session';
import { StudioLayout } from '@/components/shared/layout';
import { Spinner } from '@/components/shared/loader';
import { FeatureAccessGuard } from '@/components/shared/subscription';
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
            <Spinner />
          </div>
        </div>
      </StudioLayout>
    );
  }

  return (
    <FeatureAccessGuard
      feature="paymentTracking"
      title="Payments require a higher plan"
      message="Upgrade your subscription to access payments."
      mode="block"
    >
      <StudioLayout
        title="Per Session Payments"
        description="Manage payments for session-based memberships"
      >
        <SessionPaymentTab gymId={gymBranch.gymId} />
      </StudioLayout>
    </FeatureAccessGuard>
  );
}
