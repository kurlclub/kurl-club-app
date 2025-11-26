// Enums and Status Types
export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'checked-in'
  | 'checked-out';

export type EventType = 'check-in' | 'check-out';
export type DeviceStatus = 'online' | 'offline';
export type MemberStatus = 'active' | 'inactive';

// Core Entity Types
export type AttendanceRecord = {
  id: string;
  memberId: string;
  memberName: string;
  memberIdentifier: string;
  biometricId?: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  duration?: number;
  eventType: EventType;
  timestamp: string;
  deviceId?: string;
  profilePicture?: string;
};

export type BiometricDevice = {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  status: DeviceStatus;
  lastSeen: string;
  location?: string;
};

export type MemberInsight = {
  id: string;
  memberIdentifier: string;
  name: string;
  totalVisits: number;
  visitsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  averageDuration: number;
  favoriteTime: string;
  attendanceRate: number;
  profilePicture: string | null;
};
