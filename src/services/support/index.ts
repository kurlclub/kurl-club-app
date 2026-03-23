import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface SupportActivity {
  id: number;
  activityType: string;
  fromStatus: string | null;
  toStatus: string | null;
  message: string;
  createdByUserId: number;
  createdByUserName: string | null;
  createdByRole: string;
  createdAt: string;
}

export interface SupportTicket {
  id: number;
  gymId: number;
  gymName: string;
  subject: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'closed' | string;
  resolution: string | null;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  lastActivityAt: string;
  createdByUserId: number;
  createdByUserName: string;
  createdByUserEmail: string;
  assignedToUserId: number | null;
  assignedToUserName: string | null;
  activities: SupportActivity[] | null;
}

export interface CreateSupportTicketPayload {
  gymId: number;
  subject: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export const fetchSupportTickets = async (gymId: number) => {
  try {
    const response = await api.get<ApiResponse<SupportTicket[]>>(
      `/support/${gymId}/tickets`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    throw error;
  }
};

export const fetchSupportTicketDetail = async (
  gymId: number,
  ticketId: number
) => {
  try {
    const response = await api.get<ApiResponse<SupportTicket>>(
      `/support/${gymId}/tickets/${ticketId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching support ticket detail:', error);
    throw error;
  }
};

export const createSupportTicket = async (
  payload: CreateSupportTicketPayload
) => {
  try {
    const response = await api.post(
      `/support/${payload.gymId}/tickets`,
      {
        subject: payload.subject,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
      },
      {
        skipAuth: false,
      }
    );

    return {
      success: 'Support request submitted successfully',
      data: response,
    };
  } catch (error) {
    console.error('Error creating support ticket:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to submit support request';

    return { error: errorMessage };
  }
};
