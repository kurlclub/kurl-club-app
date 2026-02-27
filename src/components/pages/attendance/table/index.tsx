import { ColumnDef } from '@tanstack/react-table';

import { FilterConfig } from '@/lib/filters';
import type { AttendanceRecordResponse } from '@/services/attendance';
import type { BiometricDevice, MemberInsight } from '@/types/attendance';

import { BaseTable } from './base-table';

// Column definitions
export { attendanceColumns, manualModeColumns } from './attendance-columns';
export { deviceColumns } from './device-columns';
export { memberInsightsColumns as insightsColumns } from './member-insights-columns';

// Specific table implementations
export const AttendanceTableView = ({
  records,
  columns,
  filters,
}: {
  records: AttendanceRecordResponse[];
  columns: ColumnDef<AttendanceRecordResponse, unknown>[];
  filters?: FilterConfig[];
}) => <BaseTable data={records} columns={columns} filters={filters} />;

export const DeviceTableView = ({
  devices,
  columns,
}: {
  devices: BiometricDevice[];
  columns: ColumnDef<BiometricDevice, unknown>[];
}) => <BaseTable data={devices} columns={columns} />;

export const InsightsTableView = ({
  insights,
  columns,
}: {
  insights: MemberInsight[];
  columns: ColumnDef<MemberInsight, unknown>[];
}) => <BaseTable data={insights} columns={columns} />;

// Legacy export
export const MemberInsightsTableView = InsightsTableView;
