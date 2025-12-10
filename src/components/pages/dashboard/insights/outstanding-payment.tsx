import { useRouter } from 'next/navigation';

import { KViewMore } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

import { paymentColumns } from './table/payment-column';
import { PaymentTable } from './table/payment-table';

function OutstandingPayment() {
  const router = useRouter();
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useDashboardData(gymBranch?.gymId || 0);

  const outstandingPayments = dashboardData?.outstandingPayments || [];

  return (
    <Card className="relative border-none bg-secondary-blue-500 rounded-lg w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-5">
        <CardTitle className="text-white text-base font-normal leading-normal">
          Outstanding payments
        </CardTitle>
        <Button
          className="bg-transparent! h-fit w-fit p-0"
          onClick={() => router.push('/payments')}
        >
          <KViewMore className="w-8! h-8!" />
        </Button>
      </CardHeader>

      {/* Table Content */}
      <CardContent className="p-5 pt-0 k-chart">
        <PaymentTable columns={paymentColumns} data={outstandingPayments} />
      </CardContent>

      {/* Bottom Black Shade */}
      <div className="absolute bottom-0 left-0 w-full h-28 bg-linear-to-t from-secondary-blue-500 via-secondary-blue-500/70 to-transparent rounded-b-lg pointer-events-none z-10" />
    </Card>
  );
}

export default OutstandingPayment;
