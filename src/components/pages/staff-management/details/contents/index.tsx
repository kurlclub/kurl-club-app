'use client';

import React, { useEffect, useState } from 'react';

import { KTabs, TabItem } from '@/components/shared/form/k-tabs';
import { StaffType } from '@/types/staff';

import AssignedMembersTable from './assigned-members-table';
import Header from './header';
import Permissions from './permissions';

export default function Contents({
  staffId,
  staffRole,
  isEditing,
  handleSave,
  toggleEdit,
}: {
  staffId: string;
  staffRole: StaffType;
  isEditing: boolean;
  handleSave: () => Promise<boolean>;
  toggleEdit: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>(
    staffRole === 'trainer' ? 'members' : 'roles'
  );

  // Reset active tab when staff role changes
  useEffect(() => {
    setActiveTab(staffRole === 'trainer' ? 'members' : 'roles');
  }, [staffRole]);

  const tabs: TabItem[] =
    staffRole === 'trainer'
      ? [{ id: 'members', label: 'Assigned members' }]
      : [{ id: 'roles', label: 'Roles & permissions' }];

  return (
    <div className="md:px-8 pt-0 w-full max-w-[calc(100%-95px)] md:max-w-[calc(100%-300px)] lg:max-w-[calc(100%-336px)]">
      <Header
        staffId={staffId}
        staffRole={staffRole}
        isEditing={isEditing}
        handleSave={handleSave}
        toggleEdit={toggleEdit}
      />
      <div className="">
        <KTabs
          items={tabs}
          variant="underline"
          value={activeTab}
          onTabChange={setActiveTab}
          className="border-secondary-blue-500"
        />
        <div className="py-4">
          {staffRole === 'trainer' ? (
            activeTab === 'members' ? (
              <AssignedMembersTable trainerId={staffId} />
            ) : null
          ) : activeTab === 'roles' ? (
            <Permissions />
          ) : null}
        </div>
      </div>
    </div>
  );
}
