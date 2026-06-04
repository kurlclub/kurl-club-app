'use client';

import { KTabs, TabItem } from '@/components/shared/form/k-tabs';
import { useTabState } from '@/hooks/use-tab-state';
import { StaffType } from '@/types/staff';

import AssignedMembersTable from './assigned-members-table';
import Header from './header';
import Permissions from './permissions';
import SalaryConfiguration from './salary-configuration';

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
  const defaultTab = staffRole === 'trainer' ? 'members' : 'roles';

  const tabs: TabItem[] =
    staffRole === 'trainer'
      ? [
          { id: 'members', label: 'Assigned Members' },
          { id: 'roles', label: 'Roles & Permissions' },
          { id: 'salary', label: 'Salary Configuration' },
        ]
      : [
          { id: 'roles', label: 'Roles & Permissions' },
          { id: 'salary', label: 'Salary Configuration' },
        ];

  const { activeTab, handleTabChange } = useTabState(tabs, defaultTab);

  return (
    <div className="w-full min-w-0 flex-1 px-4 pt-0 md:px-8">
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
          onTabChange={handleTabChange}
          className="border-secondary-blue-500"
        />
        <div className="py-4">
          {activeTab === 'members' && staffRole === 'trainer' && (
            <AssignedMembersTable trainerId={staffId} />
          )}

          {activeTab === 'roles' && (
            <Permissions staffId={staffId} staffRole={staffRole} />
          )}

          {activeTab === 'salary' && (
            <SalaryConfiguration staffId={staffId} staffRole={staffRole} />
          )}
        </div>
      </div>
    </div>
  );
}
