import { api } from '@/lib/api';

interface NotificationSettingsResponse {
  status: string;
  data: NotificationSettings;
}

export interface NotificationSettings {
  paymentReminder: {
    enabled: boolean;
    daysBefore: number;
  };
  membershipExpiryAlert: {
    enabled: boolean;
    daysBefore: number;
    notifyOnExpiryDay: boolean;
  };
  lowAttendanceAlert: {
    enabled: boolean;
  };
  channels: {
    email: boolean;
    whatsApp: boolean;
  };
}

export const getNotificationSettings = async (
  gymId: number
): Promise<NotificationSettings | null> => {
  try {
    const response = await api.get<NotificationSettingsResponse>(
      `/Notification/gym/${gymId}/notification-settings`
    );
    // Extract data from the response wrapper
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    // If settings don't exist yet, return null instead of throwing
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateNotificationSettings = async (
  gymId: number,
  settings: NotificationSettings
) => {
  try {
    await api.put(`/Notification/gym/${gymId}/notification-settings`, settings);
    return { success: 'Notification settings updated successfully!' };
  } catch (error) {
    console.error('Error updating notification settings:', error);
    throw error;
  }
};
