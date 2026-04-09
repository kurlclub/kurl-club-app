import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

interface GymCurrencyRegion {
  id: number;
  currency: string;
  region: string;
  countryCode: string;
}

interface GymSettingsCurrencyRegion {
  currency?: string;
  region?: string;
  countryCode?: string;
}

interface GymDetailsWithRegionalSettings {
  currency?: string;
  region?: string;
  countryCode?: string;
  gymSettings?: GymSettingsCurrencyRegion[];
}

type CreateGymResponse = {
  message?: string;
  data?: {
    id?: number;
    gymId?: number;
  };
};

export const createGym = async (data: FormData) => {
  try {
    const response = await api.post<CreateGymResponse>('/Gym', data);
    return {
      success: response.message || 'Gym added successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('Error during gym creation:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to add gym.',
    };
  }
};

export const updateGym = async (gymId: number, data: FormData) => {
  await api.put(`/Gym/${gymId}`, data);
  return { success: 'Gym updated successfully!' };
};

export const updateGymCurrencyRegion = async (
  gymId: number,
  data: Pick<GymCurrencyRegion, 'currency' | 'region' | 'countryCode'>
) => {
  const response = await api.post<ApiResponse<GymCurrencyRegion>>(
    `/Gym/${gymId}/currency-region`,
    data
  );

  return {
    success:
      response.message || 'Gym currency and region updated successfully.',
    data: response.data,
  };
};

export const getGymCurrencyRegion = async (gymId: number) => {
  const response = await api.get<ApiResponse<GymDetailsWithRegionalSettings>>(
    `/Gym/${gymId}`
  );

  const root = response.data;
  const nested = root?.gymSettings?.[0];

  return {
    currency: root?.currency || nested?.currency || 'INR',
    region: root?.region || nested?.region || 'IND',
    countryCode: root?.countryCode || nested?.countryCode || '+91',
  };
};

type DeleteCheckBlockers = {
  members: number;
  trainers: number;
  staff: number;
  payments: number;
  paymentCycles: number;
  sessionPayments: number;
  attendanceRecords: number;
  expenses: number;
  leads: number;
  salaryPayments: number;
  supportTickets: number;
  workoutPlans: number;
  membershipPlans: number;
  accessPermissions: number;
  biometricDevices: number;
};

export type DeleteCheckData = {
  id: number;
  gymName: string;
  canDelete: boolean;
  blockers: DeleteCheckBlockers;
};

type DeleteCheckResponse = {
  status: string;
  message: string;
  data: DeleteCheckData;
};

export const checkGymDelete = async (gymId: number) => {
  try {
    const response = await api.get<DeleteCheckResponse>(
      `/Gym/${gymId}/delete-check`
    );
    return { data: response.data };
  } catch (error) {
    console.error('Error checking gym delete:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to fetch club data.',
    };
  }
};

export const hardDeleteGym = async (gymId: number) => {
  try {
    const response = (await api.delete(`/Gym/${gymId}/hard?confirm=true`)) as {
      message?: string;
    };
    return { success: response?.message || 'Club deleted successfully.' };
  } catch (error) {
    console.error('Error deleting gym:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete club.',
    };
  }
};

export const fetchGymProfilePicture = async (gymId: number) => {
  try {
    const response = await api.get<{
      blob: Blob;
      contentDisposition: string | null;
    }>(`/Gym/${gymId}/profile-picture`, { responseType: 'blob' });
    const url = URL.createObjectURL(response.blob);
    return { data: url };
  } catch (error) {
    console.error('Error fetching gym profile picture:', error);
    return null;
  }
};
