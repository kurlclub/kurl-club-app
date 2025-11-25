import { api } from '@/lib/api';
import { GymDetails, GymResponse } from '@/types/gym';

export const fetchGymById = async (gymId: number): Promise<GymDetails> => {
  const response = await api.get<GymResponse>(`/Gym/${gymId}`);
  return response.data;
};

export const updateGym = async (gymId: number, data: FormData) => {
  await api.put(`/Gym/${gymId}`, data);
  return { success: 'Gym updated successfully!' };
};

export const fetchGymProfilePicture = async (gymId: number) => {
  try {
    const response = await api.get(`/Gym/${gymId}/profile-picture`);
    return response;
  } catch (error) {
    console.error('Error fetching gym profile picture:', error);
    throw error;
  }
};
