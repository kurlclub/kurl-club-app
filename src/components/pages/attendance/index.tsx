'use client';

import { TabItem } from '@/components/shared/form/k-tabs';
import { StudioLayout } from '@/components/shared/layout';
import { FeatureAccessGuard } from '@/components/shared/subscription';
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
    <FeatureAccessGuard
      feature="attendanceTracking"
      title="Attendance requires a higher plan"
      message="Upgrade your subscription to access attendance."
      mode="block"
    >
      <StudioLayout
        title="Attendance Management"
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      >
        {activeTab === 'dashboard' && (
          <FeatureAccessGuard
            feature="liveAttendance"
            title="Live attendance requires a higher plan"
            message="Upgrade your subscription to access live attendance."
            mode="overlay"
          >
            <Dashboard />
          </FeatureAccessGuard>
        )}
        {activeTab === 'records' && <AttendanceRecords />}
        {activeTab === 'insights' && <MemberInsights />}
        {activeTab === 'devices' && (
          <FeatureAccessGuard
            feature="liveAttendance"
            title="Device access requires a higher plan"
            message="Upgrade your subscription to manage devices."
            mode="overlay"
          >
            <DeviceManagement />
          </FeatureAccessGuard>
        )}
      </StudioLayout>
    </FeatureAccessGuard>
  );
}
