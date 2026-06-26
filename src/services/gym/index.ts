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
  inactiveAfterDays?: number;
  skipperDays?: number;
  gymSettings?: GymSettingsCurrencyRegion[];
}

export interface MemberActivitySettings {
  inactiveAfterDays: number | null;
  skipperDays: number | null;
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

export const getMemberActivitySettings = async (
  gymId: number
): Promise<MemberActivitySettings> => {
  const response = await api.get<ApiResponse<GymDetailsWithRegionalSettings>>(
    `/Gym/${gymId}`
  );

  const root = response.data;

  return {
    inactiveAfterDays: root?.inactiveAfterDays ?? null,
    skipperDays: root?.skipperDays ?? null,
  };
};

export const updateInactiveDays = async (
  gymId: number,
  inactiveAfterDays: number
) => {
  try {
    const response = await api.put<ApiResponse<null>>(
      `/Gym/${gymId}/inactive-days`,
      { inactiveAfterDays }
    );
    return {
      success: response.message || 'Inactivity threshold updated.',
    };
  } catch (error) {
    console.error('Error updating inactive days:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update inactivity threshold.',
    };
  }
};

export const updateSkipperDays = async (gymId: number, skipperDays: number) => {
  try {
    const response = await api.put<ApiResponse<{ skipperDays?: number }>>(
      `/Gym/${gymId}/skipper-days`,
      { skipperDays }
    );
    return {
      success: response.message || 'Skipper threshold updated.',
    };
  } catch (error) {
    console.error('Error updating skipper days:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update skipper threshold.',
    };
  }
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

export const fetchGstNumber = async (gymId: number) => {
  try {
    const response = await api.get<
      ApiResponse<{ gymName: string; gstNumber: string | null }>
    >(`/Gym/${gymId}/gst-number`);
    return response;
  } catch (error) {
    console.error('Error fetching GST number:', error);
    return {
      status: 'Error',
      error:
        error instanceof Error ? error.message : 'Failed to fetch GST number.',
    };
  }
};

export const addGstNumber = async (gymId: number, gstNumber: string) => {
  try {
    const response = await api.put<ApiResponse<null>>(
      `/Gym/${gymId}/gst-number`,
      { gstNumber }
    );
    return {
      success: response.message || 'GST number added successfully.',
    };
  } catch (error) {
    console.error('Error adding GST number:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to add GST number.',
    };
  }
};

export const deleteGstNumber = async (gymId: number) => {
  try {
    const response = (await api.delete(
      `/Gym/${gymId}/gst-number`
    )) as unknown as ApiResponse;
    return {
      success: response.message || 'GST number deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting GST number:', error);
    return {
      error:
        error instanceof Error ? error.message : 'Failed to delete GST number.',
    };
  }
};
