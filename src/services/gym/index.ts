import { api } from '@/lib/api';

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
