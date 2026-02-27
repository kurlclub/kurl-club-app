import { api } from '@/lib/api';

export interface Session {
  id: number;
  sessionId: string;
  deviceName: string;
  deviceType: string;
  platform: string;
  browser: string;
  browserVersion: string | null;
  appName: string | null;
  appVersion: string | null;
  ipAddress: string;
  location: string | null;
  isActive: boolean;
  isOnline: boolean;
  loginAt: string;
  lastActivityAt: string;
  isCurrent: boolean;
  daysActive: number;
}

interface SessionsResponse {
  status: string;
  data: {
    totalSessions: number;
    activeSessions: number;
    sessions: Session[];
  };
}

export const getSessions = async () => {
  try {
    const response = await api.get<SessionsResponse>('/Auth/sessions');
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

export const revokeSession = async (sessionId: string) => {
  try {
    await api.delete(`/Auth/sessions/${sessionId}`);
    return { success: 'Session revoked successfully' };
  } catch (error) {
    console.error('Error revoking session:', error);
    throw error;
  }
};

export const revokeAllOtherSessions = async () => {
  try {
    await api.delete('/Auth/sessions/others');
    return { success: 'All other sessions revoked successfully' };
  } catch (error) {
    console.error('Error revoking all sessions:', error);
    throw error;
  }
};
