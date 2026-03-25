import { api } from '@/lib/api';

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
