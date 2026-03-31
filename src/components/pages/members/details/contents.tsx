'use client';

import React, { useState } from 'react';

import { KTabs } from '@/components/shared/form/k-tabs';
import { FormOptionsResponse } from '@/hooks/use-gymform-options';
import { MemberDetails } from '@/types/member.types';

import { Chart } from './chart';
import Header from './header';
import { PaymentStats } from './payment-stats';
import { ProgressSection } from './progress';

//TODO: Re-enable planner section when the feature is ready

// import PlannerSection from './planner-section';

const CONTENT_TABS = [
  { id: 'payments', label: 'Payment Stats' },
  { id: 'overview', label: 'Attendance Stats' },
  { id: 'progress', label: 'Progress Tracking' },
];

function Contents({
  memberId,
  isEditing,
  handleSave,
  toggleEdit,
  // details,
  // originalDetails,
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
  const [activeTab, setActiveTab] = useState('payments');

  return (
    <div className="px-4 md:px-8 py-4 md:py-8 pt-0! w-full">
      <Header
        memberId={memberId}
        isEditing={isEditing}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />

      <div className="mt-3">
        <KTabs
          items={CONTENT_TABS}
          variant="underline"
          value={activeTab}
          onTabChange={setActiveTab}
          className="border-secondary-blue-500"
        />

        <div className="mt-4">
          {activeTab === 'payments' && (
            <PaymentStats memberId={memberId} formOptions={formOptions} />
          )}

          {activeTab === 'overview' && <Chart />}

          {activeTab === 'progress' && <ProgressSection memberId={memberId} />}
        </div>
      </div>
    </div>
  );
}

export default Contents;
