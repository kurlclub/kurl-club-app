import Link from 'next/link';

import { KViewMore } from '@/components/shared/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

import { SkipperColumns } from './table/skipper-column';
import { SkipperTable } from './table/skipper-table';

function SkipperStats() {
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useDashboardData(gymBranch?.gymId || 0);

  const skipperData =
    dashboardData?.skipperStats?.map((skipper) => ({
      memberId: skipper.memberId,
      memberIdentifier: skipper.memberIdentifier,
      memberName: skipper.memberName,
      photoPath: skipper.photoPath,
      lastCheckIn: skipper.lastCheckIn,
      daysSinceLastCheckIn: skipper.daysSinceLastCheckIn,
    })) || [];

  return (
    <Card className="relative border-none bg-secondary-blue-500 rounded-lg w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-5">
        <CardTitle className="text-white text-base font-normal leading-normal">
          Skipper stats
        </CardTitle>
        <Button className="bg-transparent! h-fit w-fit p-0" asChild>
          <Link href="/attendance">
            <KViewMore className="w-8! h-8!" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-5 pt-0 k-chart">
        <SkipperTable columns={SkipperColumns} data={skipperData} />
      </CardContent>

      <div className="absolute bottom-0 left-0 w-full h-28 bg-linear-to-t from-secondary-blue-500 via-secondary-blue-500/70 to-transparent rounded-b-lg pointer-events-none z-10" />
    </Card>
  );
}

export default SkipperStats;
