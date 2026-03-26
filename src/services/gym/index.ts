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
