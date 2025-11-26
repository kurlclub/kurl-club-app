import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface BufferConfig {
  id: number;
  gymId: number;
  membershipPlanId: number;
  feeBufferAmount: number;
  feeBufferDays: number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CreateBufferConfigData {
  gymId: number;
  membershipPlanId: number;
  feeBufferAmount: number;
  feeBufferDays: number;
}

export const createBufferConfig = async (data: CreateBufferConfigData) => {
  try {
    const response = await api.post<ApiResponse<BufferConfig>>(
      '/Transaction/create-buffer-config',
      data
    );
    return {
      success: 'Buffer configuration created successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('Error creating buffer config:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to create buffer configuration';
    return { error: errorMessage };
  }
};

export const getBufferConfig = async (id: number) => {
  const response = await api.get<ApiResponse<BufferConfig>>(
    `/Transaction/get-buffer-config/${id}`
  );
  return response.data;
};

export const getBufferConfigsByGym = async (gymId: number) => {
  const response = await api.get<ApiResponse<BufferConfig[]>>(
    `/Transaction/get-buffer-configs-by-gym/${gymId}`
  );
  return response.data || [];
};

export const updateBufferConfig = async (
  id: number,
  data: CreateBufferConfigData
) => {
  try {
    const response = await api.put<ApiResponse<BufferConfig>>(
      `/Transaction/update-buffer-config/${id}`,
      data
    );
    return {
      success: 'Buffer configuration updated successfully!',
      data: response.data,
    };
  } catch (error) {
    console.error('Error updating buffer config:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to update buffer configuration';
    return { error: errorMessage };
  }
};

export const deleteBufferConfig = async (id: number) => {
  try {
    await api.delete(`/Transaction/delete-buffer-config/${id}`);
    return { success: 'Buffer configuration deleted successfully!' };
  } catch (error) {
    console.error('Error deleting buffer config:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to delete buffer configuration';
    return { error: errorMessage };
  }
};
