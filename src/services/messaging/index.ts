import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface MemberOnboardingFormData {
  name: string;
  phone: string;
  gymId: number;
}

export interface MemberOnboardingResponse {
  messageId: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
}

export const sendMemberOnboardingForm = async (
  data: MemberOnboardingFormData
) => {
  try {
    const response = await api.post<ApiResponse<MemberOnboardingResponse>>(
      '/Messaging/member-onboarding-form',
      data
    );
    return {
      success: 'Onboarding form sent successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('Error sending onboarding form:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send onboarding form';
    return { error: errorMessage };
  }
};
