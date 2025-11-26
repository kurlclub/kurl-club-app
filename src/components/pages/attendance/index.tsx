'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { useTabState } from '@/hooks/use-tab-state';

import {
  AttendanceRecords,
  Dashboard,
  DeviceManagement,
  MemberInsights,
} from './tabs';

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'records', label: 'Attendance Records' },
  { id: 'insights', label: 'Member Insights' },
  { id: 'devices', label: 'Device Management' },
];

export default function AttendanceMain() {
  const { activeTab, handleTabChange } = useTabState(TABS, 'dashboard');

  return (
    <StudioLayout
      title="Attendance Management"
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'records' && <AttendanceRecords />}
      {activeTab === 'insights' && <MemberInsights />}
      {activeTab === 'devices' && <DeviceManagement />}
    </StudioLayout>
  );
}
