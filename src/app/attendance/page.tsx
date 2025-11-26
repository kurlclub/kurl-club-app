import type { Metadata } from 'next';

import AttendanceMain from '@/components/pages/attendance';

export const metadata: Metadata = {
  title: 'Attendance',
  description: 'Track member attendance and gym visit records',
};

const AttendancePage = () => {
  return <AttendanceMain />;
};

export default AttendancePage;
