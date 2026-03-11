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
