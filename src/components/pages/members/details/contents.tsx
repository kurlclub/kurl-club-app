'use client';

import React from 'react';

import { Clock4 } from 'lucide-react';

import InfoCard from '@/components/shared/cards/info-card';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { MemberDetails } from '@/types/members';

import { Chart } from './chart';
import Header from './header';
import PaymentCard from './payment-card';
import PlannerSection from './planner-section';

function Contents({
  memberId,
  isEditing,
  handleSave,
  toggleEdit,
  details,
  originalDetails,
  formOptions,
}: {
  memberId: string;
  isEditing: boolean;
  handleSave: () => Promise<boolean>;
  toggleEdit: () => void;
  details: MemberDetails | null;
  originalDetails: MemberDetails | null;
  formOptions?: FormOptionsResponse;
}) {
  return (
    <div className="px-4 md:px-8 py-4 md:py-8 pt-0! w-full">
      <Header
        memberId={memberId}
        isEditing={isEditing}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />
      <InfoCard
        item={{
          id: 1,
          icon: <Clock4 className="text-black" />,
          color: 'primary-green-500',
          title: 'Total hours spent',
          count: 10,
        }}
        className="max-w-[332px]! w-full md:mt-4"
      />
      <div className="grid grid-cols-1 [@media(max-width:900px)]:grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-4 mt-3">
        <Chart />
        <PaymentCard memberId={memberId} formOptions={formOptions} />
      </div>
      <PlannerSection memberDetails={originalDetails || details} />
    </div>
  );
}

export default Contents;
