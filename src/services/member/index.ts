import { QueryClient, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import { Member, MemberDetails } from '@/types/members';
import { MemberPaymentDetails } from '@/types/payment';

export const createMember = async (data: FormData) => {
  try {
    const response = await api.post('/Member', data);

    return { success: 'Member created successfully!', data: response };
  } catch (error) {
    console.error('Error during member creation:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during member creation.';

    return { error: errorMessage };
  }
};

export type MemberFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  feeStatus?: string;
  package?: string;
  gender?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedMembers = {
  data: Member[];
  pagination: {
    totalCount: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
  };
  availableFilters?: {
    feeStatuses: { value: string; count: number }[];
    packages: { value: string; label: string; count: number }[];
    genders: { value: string; count: number }[];
  };
};

export const fetchGymMembers = async (
  gymId: number | string,
  filters?: MemberFilters
) => {
  const params = new URLSearchParams();
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.feeStatus) params.append('feeStatus', filters.feeStatus);
  if (filters?.package) params.append('package', filters.package);
  if (filters?.gender) params.append('gender', filters.gender);
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

  const url = `/Member/gym/${gymId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await api.get<{
    status: string;
    data: Member[];
    pagination: PaginatedMembers['pagination'];
    availableFilters?: PaginatedMembers['availableFilters'];
  }>(url);
  return {
    data: response.data,
    pagination: response.pagination,
    availableFilters: response.availableFilters,
  };
};

export const useGymMembers = (
  gymId: number | string,
  filters?: MemberFilters
) => {
  return useQuery({
    queryKey: ['gymMembers', gymId, filters],
    queryFn: () => fetchGymMembers(gymId, filters),
    enabled: !!gymId,
    staleTime: 1000 * 60,
    retry: 1,
    placeholderData: (previousData) => previousData,
  });
};

// For components that need all members (frontend filtering)
export const useAllGymMembers = (gymId: number | string) => {
  return useQuery({
    queryKey: ['allGymMembers', gymId],
    queryFn: async () => {
      const response = await fetchGymMembers(gymId, { pageSize: 9999 });
      return response.data;
    },
    enabled: !!gymId,
    staleTime: 1000 * 60,
    retry: 1,
  });
};

export const fetchMemberByID = async (id: string | number) => {
  const response = await api.get<{ status: string; data: MemberDetails }>(
    `/Member/${id}`
  );

  return response.data;
};

export const useMemberByID = (id: string | number) => {
  return useQuery({
    queryKey: ['member', id],
    queryFn: () => fetchMemberByID(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });
};

export const updateMember = async (id: string | number, data: FormData) => {
  try {
    const response = await api.put<ApiResponse>(`/Member/${id}`, data);

    return response;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
};

export const deleteMember = async (
  id: string | number,
  queryClient?: QueryClient
) => {
  try {
    await api.delete(`/Member/${id}`);

    // Invalidate all gym members queries
    if (queryClient) {
      await queryClient.invalidateQueries({ queryKey: ['gymMembers'] });
    }

    return { success: 'Member deleted successfully!' };
  } catch (error) {
    console.error('Error deleting member:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while deleting the member.';

    return { error: errorMessage };
  }
};

export const bulkImportMembers = async (members: Member[]) => {
  try {
    const response = await api.post('/Gym/bulk-import-members', members);
    return { success: 'Members imported successfully!', data: response };
  } catch (error) {
    console.error('Error during bulk import:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during bulk import.';
    return { error: errorMessage };
  }
};

export const fetchMemberPaymentDetails = async (memberId: number | string) => {
  const response = await api.get<{
    status: string;
    data: MemberPaymentDetails;
  }>(`/Transaction/GetPaymentDetailsByMember/${memberId}`);
  return response;
};

export const useMemberPaymentDetails = (memberId: number | string) => {
  return useQuery({
    queryKey: ['memberPaymentDetails', memberId],
    queryFn: () => fetchMemberPaymentDetails(memberId),
    enabled: !!memberId,
  });
};

export const fetchPendingOnboardingMembers = async (gymId: number | string) => {
  const response = await api.get<ApiResponse<Member[]>>(
    `/Member/onboarding/${gymId}`
  );
  return response.data || [];
};

export const usePendingOnboardingMembers = (gymId: number | string) => {
  return useQuery({
    queryKey: ['pendingOnboardingMembers', gymId],
    queryFn: () => fetchPendingOnboardingMembers(gymId),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 3,
    refetchOnMount: true,
    retry: 1,
  });
};

export const fetchPendingMemberDetails = async (id: string | number) => {
  const response = await api.get<{ status: string; data: MemberDetails }>(
    `/Member/onboarding/details/${id}`
  );
  return response.data;
};

export const rejectOnboardingMember = async (
  id: string | number,
  queryClient?: QueryClient
) => {
  try {
    await api.delete(`/Member/onboarding/${id}`);

    if (queryClient) {
      await queryClient.invalidateQueries({
        queryKey: ['pendingOnboardingMembers'],
      });
    }

    return { success: 'Onboarding request rejected successfully!' };
  } catch (error) {
    console.error('Error rejecting onboarding member:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred while rejecting the request.';

    return { error: errorMessage };
  }
};
