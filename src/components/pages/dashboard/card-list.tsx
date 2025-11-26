import React from 'react';

import { IndianRupee, Users } from 'lucide-react';

import { useGymBranch } from '@/providers/gym-branch-provider';
import { useDashboardData } from '@/services/dashboard';

import InfoCard from '../../shared/cards/info-card';
import { KDumbbell, KSkipper } from '../../shared/icons/index';

function CardList() {
  const { gymBranch } = useGymBranch();
  const { data: dashboardData } = useDashboardData(gymBranch?.gymId || 0);

  const cards = [
    {
      id: 1,
      icon: <Users size={20} strokeWidth={1.75} color="#151821" />,
      color: 'primary-green-500',
      title: 'Active members',
      count: dashboardData?.totalMembers || 0,
    },
    {
      id: 2,
      icon: <IndianRupee size={20} strokeWidth={1.75} color="#151821" />,
      color: 'secondary-pink-500',
      title: 'Outstanding payments',
      count: dashboardData?.outstandingPaymentsCount || 0,
    },
    {
      id: 3,
      icon: <KSkipper />,
      color: 'secondary-yellow-150',
      title: 'Skippers',
      count: dashboardData?.skippersCount || 0,
    },
    {
      id: 4,
      icon: <KDumbbell />,
      color: 'semantic-blue-500',
      title: 'New Signups',
      count: dashboardData?.newSignups || 0,
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((item) => (
        <InfoCard item={item} key={item.id} />
      ))}
    </div>
  );
}

export default CardList;
