import * as signalR from '@microsoft/signalr';

import { API_BASE_URL } from '@/lib/utils';

export type AttendanceRealtimeEventType = 'check_in' | 'check_out';

export interface AttendanceRealtimeRecord {
  id: number;
  memberId: number;
  memberIdentifier: string;
  memberName: string;
  date: string;
  checkInTime: string;
  checkOutTime: string | null;
  duration: number;
  status: string;
  mode: string;
  photoPath?: string | null;
  recordedBy?: {
    userId: number;
    userName: string | null;
    email: string;
    role: string;
  } | null;
}

export interface AttendanceRealtimeUpdate {
  eventType: AttendanceRealtimeEventType;
  timestamp: string;
  data: AttendanceRealtimeRecord;
}

type AttendanceUpdateListener = (update: AttendanceRealtimeUpdate) => void;
export type AttendanceRealtimeConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';
type AttendanceConnectionStateListener = (
  state: AttendanceRealtimeConnectionState
) => void;

const normalizeEventType = (
  value: unknown
): AttendanceRealtimeEventType | null => {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/-/g, '_');

  if (normalized === 'check_in' || normalized === 'checkin') return 'check_in';
  if (normalized === 'check_out' || normalized === 'checkout')
    return 'check_out';
  return null;
};

class AttendanceSignalRService {
  private connection: signalR.HubConnection | null = null;
  private connectionHubUrl: string | null = null;
  private isConnected = false;
  private connectionState: AttendanceRealtimeConnectionState = 'disconnected';
  private connectPromise: Promise<void> | null = null;
  private joinedGymId: number | null = null;
  private activeGymSubscriberCount = 0;
  private gymGroupOperationQueue: Promise<void> = Promise.resolve();
  private listeners = new Set<AttendanceUpdateListener>();
  private connectionStateListeners =
    new Set<AttendanceConnectionStateListener>();

  private runWithGymGroupLock<T>(operation: () => Promise<T>): Promise<T> {
    const execute = async () => operation();
    const result = this.gymGroupOperationQueue.then(execute, execute);
    this.gymGroupOperationQueue = result.then(
      () => undefined,
      () => undefined
    );
    return result;
  }

  private setConnectionState(state: AttendanceRealtimeConnectionState) {
    if (this.connectionState === state) return;
    this.connectionState = state;
    this.connectionStateListeners.forEach((listener) => listener(state));
  }

  private getHubUrlCandidates() {
    const explicitHubUrl = process.env.NEXT_PUBLIC_ATTENDANCE_HUB_URL;
    if (explicitHubUrl) {
      return [explicitHubUrl.replace(/\/$/, '')];
    }

    const normalizedBaseUrl = API_BASE_URL.replace(/\/$/, '');
    const strippedApiBaseUrl = normalizedBaseUrl.replace(/\/api$/i, '');
    const hubUrls = [`${strippedApiBaseUrl}/hubs/attendance`];
    if (strippedApiBaseUrl !== normalizedBaseUrl) {
      hubUrls.push(`${normalizedBaseUrl}/hubs/attendance`);
    }

    return [...new Set(hubUrls)];
  }

  private normalizeUpdate(payload: unknown): AttendanceRealtimeUpdate | null {
    if (!payload || typeof payload !== 'object') return null;

    const raw = payload as Record<string, unknown>;
    const eventType = normalizeEventType(
      raw.eventType || raw.event_type || raw.type
    );
    const data = (raw.data || raw.attendance || raw.record) as
      | Record<string, unknown>
      | undefined;
    if (!eventType || !data) return null;

    const id = Number(data.id);
    const memberId = Number(data.memberId);
    if (!Number.isFinite(id) || !Number.isFinite(memberId)) return null;

    const memberIdentifier = String(
      data.memberIdentifier ||
        data.memberCode ||
        data.memberID ||
        `#${memberId}`
    );
    const memberName = String(data.memberName || data.name || 'Unknown Member');

    return {
      eventType,
      timestamp: String(raw.timestamp || new Date().toISOString()),
      data: {
        id,
        memberId,
        memberIdentifier,
        memberName,
        date: String(data.date || ''),
        checkInTime: String(data.checkInTime || ''),
        checkOutTime: data.checkOutTime ? String(data.checkOutTime) : null,
        duration: Number(data.duration || 0),
        status: String(data.status || ''),
        mode: String(data.mode || 'manual'),
        photoPath: data.photoPath ? String(data.photoPath) : null,
        recordedBy: data.recordedBy
          ? {
              userId: Number(
                (data.recordedBy as Record<string, unknown>).userId || 0
              ),
              userName:
                ((data.recordedBy as Record<string, unknown>)
                  .userName as string) || null,
              email: String(
                (data.recordedBy as Record<string, unknown>).email || ''
              ),
              role: String(
                (data.recordedBy as Record<string, unknown>).role || ''
              ),
            }
          : null,
      },
    };
  }

  private emit(update: AttendanceRealtimeUpdate) {
    this.listeners.forEach((listener) => listener(update));
  }

  private async createConnection(hubUrl: string) {
    if (this.connection && this.connectionHubUrl === hubUrl)
      return this.connection;

    if (this.connection) {
      await this.connection.stop().catch(() => undefined);
      this.connection = null;
      this.connectionHubUrl = null;
      this.isConnected = false;
      this.setConnectionState('disconnected');
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        transport:
          signalR.HttpTransportType.WebSockets |
          signalR.HttpTransportType.LongPolling,
        accessTokenFactory: () =>
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken') || ''
            : '',
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        process.env.NODE_ENV === 'development'
          ? signalR.LogLevel.Information
          : signalR.LogLevel.Warning
      )
      .build();

    connection.on('AttendanceUpdate', (payload: unknown) => {
      const normalized = this.normalizeUpdate(payload);
      if (!normalized) return;
      this.emit(normalized);
    });

    connection.onreconnecting(() => {
      this.isConnected = false;
      this.setConnectionState('reconnecting');
    });

    connection.onreconnected(async () => {
      this.isConnected = true;
      this.setConnectionState('connected');
      if (this.joinedGymId && this.connection) {
        try {
          await this.connection.invoke(
            'JoinGymAttendanceGroup',
            this.joinedGymId.toString()
          );
        } catch {
          // no-op
        }
      }
    });

    connection.onclose(() => {
      this.isConnected = false;
      this.setConnectionState('disconnected');
    });

    this.connection = connection;
    this.connectionHubUrl = hubUrl;
    return connection;
  }

  private async startConnection(connection: signalR.HubConnection) {
    if (connection.state === signalR.HubConnectionState.Connected) {
      this.isConnected = true;
      this.setConnectionState('connected');
      return;
    }

    this.setConnectionState('connecting');
    await connection.start();
    this.isConnected = true;
    this.setConnectionState('connected');
  }

  private async joinGymGroupOnServer(gymId: number) {
    await this.connect();
    if (!this.connection || !this.isConnected) {
      throw new Error('SignalR connection is not active');
    }

    await this.connection.invoke('JoinGymAttendanceGroup', gymId.toString());
  }

  private async leaveGymGroupOnServer(gymId: number) {
    if (this.joinedGymId !== gymId) return;

    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveGymAttendanceGroup', gymId.toString());
    }

    if (this.joinedGymId === gymId) {
      this.joinedGymId = null;
      this.activeGymSubscriberCount = 0;
    }
  }

  private async disconnectIfIdle() {
    if (!this.connection) return;
    if (this.listeners.size > 0) return;
    if (this.joinedGymId !== null) return;

    await this.connection.stop();
    this.connection = null;
    this.connectionHubUrl = null;
    this.isConnected = false;
    this.setConnectionState('disconnected');
  }

  async connect() {
    if (this.connection && this.isConnected) return;
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = (async () => {
      const hubUrls = this.getHubUrlCandidates();
      let latestError: unknown;

      for (const hubUrl of hubUrls) {
        try {
          const connection = await this.createConnection(hubUrl);
          await this.startConnection(connection);
          return;
        } catch (error) {
          latestError = error;
          this.isConnected = false;
          this.setConnectionState('disconnected');
          if (this.connection) {
            await this.connection.stop().catch(() => undefined);
          }
          this.connection = null;
          this.connectionHubUrl = null;
        }
      }

      const message =
        latestError instanceof Error
          ? latestError.message
          : String(latestError);
      throw new Error(
        `Failed to connect to attendance realtime hub. Tried ${hubUrls.join(', ')}. Last error: ${message}`
      );
    })();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  async joinGymGroup(gymId: number) {
    return this.runWithGymGroupLock(async () => {
      if (this.joinedGymId === gymId) {
        this.activeGymSubscriberCount += 1;
        return;
      }

      if (this.joinedGymId && this.joinedGymId !== gymId) {
        await this.leaveGymGroupOnServer(this.joinedGymId);
      }

      await this.joinGymGroupOnServer(gymId);
      this.joinedGymId = gymId;
      this.activeGymSubscriberCount = 1;
    });
  }

  async leaveGymGroup(gymId?: number) {
    return this.runWithGymGroupLock(async () => {
      const targetGymId = gymId || this.joinedGymId;
      if (!targetGymId) return;
      if (this.joinedGymId !== targetGymId) return;

      this.activeGymSubscriberCount = Math.max(
        this.activeGymSubscriberCount - 1,
        0
      );
      if (this.activeGymSubscriberCount > 0) return;

      await this.leaveGymGroupOnServer(targetGymId);
      await this.disconnectIfIdle();
    });
  }

  subscribeAttendanceUpdates(listener: AttendanceUpdateListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      this.disconnectIfIdle().catch(() => undefined);
    };
  }

  subscribeConnectionState(listener: AttendanceConnectionStateListener) {
    this.connectionStateListeners.add(listener);
    listener(this.connectionState);
    return () => {
      this.connectionStateListeners.delete(listener);
    };
  }
}

export const attendanceSignalRService = new AttendanceSignalRService();
