'use client';

import { useEffect, useState } from 'react';

import { format } from 'date-fns';
import { toast } from 'sonner';

import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/providers/auth-provider';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  ATTENDANCE_POLLING,
  useAttendanceRealtimeSync,
  useAttendanceRecords,
  useCheckInMember,
  useCheckOutMember,
} from '@/services/attendance';
import { useAllGymMembers } from '@/services/member';

import { AttendanceSuccessModal } from '../attendance-success-modal';
import { QuickAttendanceCommand } from '../quick-attendance-command';
import {
  AttendanceTableView,
  attendanceColumns,
  manualModeColumns,
} from '../table';

export default function AttendanceRecords() {
  const { user } = useAuth();
  const { gymBranch } = useGymBranch();
  const [isPageVisible, setIsPageVisible] = useState(() =>
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true
  );
  const shouldRunAttendanceSync = !!gymBranch?.gymId && isPageVisible;
  const { connectionState } = useAttendanceRealtimeSync(gymBranch?.gymId, {
    enabled: shouldRunAttendanceSync,
  });
  const attendanceRefetchInterval = !shouldRunAttendanceSync
    ? false
    : connectionState === 'connected'
      ? ATTENDANCE_POLLING.SAFETY_REFRESH_INTERVAL_MS
      : connectionState === 'connecting'
        ? false
        : ATTENDANCE_POLLING.FALLBACK_POLLING_INTERVAL_MS;

  const { data: members = [] } = useAllGymMembers(gymBranch?.gymId || 0);
  const { data: attendanceResponse } = useAttendanceRecords(gymBranch?.gymId, {
    enabled: shouldRunAttendanceSync,
    refetchInterval: attendanceRefetchInterval,
  });
  const attendanceRecords = attendanceResponse?.data || [];
  const checkInMutation = useCheckInMember();
  const checkOutMutation = useCheckOutMember();

  const [isManualMode, setIsManualMode] = useState(() => {
    const saved = localStorage.getItem('attendance-manual-mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    member: {
      name: string;
      identifier: string;
      photoPath?: string | null;
    } | null;
    action: 'checkin' | 'checkout';
    time: string;
  }>({ open: false, member: null, action: 'checkin', time: '' });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleManualModeToggle = (checked: boolean) => {
    setIsManualMode(checked);
    localStorage.setItem('attendance-manual-mode', JSON.stringify(checked));
  };

  const handleCheckIn = async (member: {
    id: number;
    name: string;
    identifier: string;
  }) => {
    if (!gymBranch?.gymId || !user?.userId) return;

    try {
      await checkInMutation.mutateAsync({
        memberId: member.id,
        gymId: gymBranch.gymId,
        recordedBy: user.userId,
      });

      setConfirmDialog({
        open: true,
        member: {
          name: member.name,
          identifier: member.identifier,
          photoPath: members.find((m) => m.memberId === member.id)?.photoPath,
        },
        action: 'checkin',
        time: format(new Date(), 'h:mm a'),
      });
      toast.success('Member checked in successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-in failed');
    }
  };

  const handleCheckOut = async (member: {
    id: number;
    name: string;
    identifier: string;
  }) => {
    if (!gymBranch?.gymId || !user?.userId) return;

    try {
      await checkOutMutation.mutateAsync({
        memberId: member.id,
        gymId: gymBranch.gymId,
        recordedBy: user.userId,
      });

      setConfirmDialog({
        open: true,
        member: {
          name: member.name,
          identifier: member.identifier,
          photoPath: members.find((m) => m.memberId === member.id)?.photoPath,
        },
        action: 'checkout',
        time: format(new Date(), 'h:mm a'),
      });
      toast.success('Member checked out successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-out failed');
    }
  };

  const handleQuickCheckOut = async (memberId: number) => {
    if (!gymBranch?.gymId || !user?.userId) return;

    const attendanceRecord = attendanceRecords.find(
      (r) => r.memberId === memberId
    );
    if (!attendanceRecord) return;

    const member = members.find((m) => m.memberId === memberId);
    if (!member) return;

    try {
      await checkOutMutation.mutateAsync({
        memberId: member.memberId,
        gymId: gymBranch.gymId,
        recordedBy: user.userId,
      });

      setConfirmDialog({
        open: true,
        member: {
          name: attendanceRecord.memberName,
          identifier: attendanceRecord.memberIdentifier,
          photoPath: members.find(
            (m) => m.memberIdentifier === attendanceRecord.memberIdentifier
          )?.photoPath,
        },
        action: 'checkout',
        time: format(new Date(), 'h:mm a'),
      });
      toast.success('Member checked out successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Check-out failed');
    }
  };

  const filters = [
    {
      columnId: 'status',
      title: 'Status',
      options: [
        { label: 'Checked In', value: 'checked-in' },
        { label: 'Checked Out', value: 'checked-out' },
        { label: 'Present', value: 'present' },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-y-2">
        <div>
          <h3 className="text-gray-900 dark:text-white text-lg font-medium">
            Visit Records
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Track member visits and gym usage patterns
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isManualMode && (
            <QuickAttendanceCommand
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          )}
          <div className="flex items-center gap-2">
            <Switch
              checked={isManualMode}
              onCheckedChange={handleManualModeToggle}
              className="data-[state=checked]:bg-primary-green-500"
            />
            <span className="text-sm text-gray-900 dark:text-white">
              Manual Mode
            </span>
          </div>
        </div>
      </div>

      <AttendanceTableView
        records={attendanceRecords}
        columns={
          isManualMode
            ? manualModeColumns(handleQuickCheckOut)
            : attendanceColumns
        }
        filters={filters}
      />

      <AttendanceSuccessModal
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        member={confirmDialog.member}
        action={confirmDialog.action}
        time={confirmDialog.time}
      />
    </div>
  );
}
