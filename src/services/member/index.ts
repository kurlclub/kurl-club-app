import { QueryClient, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import {
  MemberDetailsResponse,
  MemberListItem,
  MemberListResponse,
  MemberQueryFilters,
  MemberUpdateResponse,
  OnboardingMemberDetailsResponse,
  OnboardingMemberListResponse,
} from '@/types/member.types';
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

export type MemberFilters = MemberQueryFilters;

export type PaginatedMembers = Omit<
  MemberListResponse,
  'status' | 'appliedFilters'
>;

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

  const url = `/Member/${gymId}/gym-members${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await api.get<MemberListResponse>(url);
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
  const response = await api.get<MemberDetailsResponse>(`/Member/${id}`);
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
    const response = await api.put<MemberUpdateResponse>(`/Member/${id}`, data);
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

export const bulkImportMembers = async (members: MemberListItem[]) => {
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
  const memberResponse = await api.get<MemberDetailsResponse>(
    `/Member/${memberId}`
  );
  const memberData = memberResponse.data;

  // Transform to MemberPaymentDetails format
  if (
    memberData.membershipPlan?.billingType === 'PerSession' &&
    memberData.sessionPaymentInfo
  ) {
    const sessionInfo = memberData.sessionPaymentInfo;
    const transformedData: MemberPaymentDetails = {
      memberId: memberData.memberId,
      memberName: memberData.memberName,
      memberIdentifier: memberData.memberIdentifier,
      membershipPlanId: memberData.membershipPlanId,
      billingType: 'PerSession',
      membershipPlanName: memberData.membershipPlan.planName,
      sessions: {
        used: sessionInfo.paidSessions || 0,
        total: sessionInfo.totalSessions || 0,
      },
      paymentSummary: {
        paid: sessionInfo.totalPaid || 0,
        total: (sessionInfo.totalPaid || 0) + (sessionInfo.totalPending || 0),
        pending: sessionInfo.totalPending || 0,
      },
      status: memberData.feeStatus as 'paid' | 'unpaid' | 'partially_paid',
      package: memberData.membershipPlan.planName,
      sessionFee: sessionInfo.sessionRate || memberData.perSessionRate || 0,
      customSessionRate:
        sessionInfo.customRate || memberData.perSessionRate || 0,
      unpaidSessions: sessionInfo.unpaidSessions || 0,
      totalSessionDebt: sessionInfo.totalPending || 0,
      sessionPayments: (sessionInfo.recentUnpaidSessions || []).map((s) => ({
        sessionId: s.attendanceId || 0,
        sessionDate: s.sessionDate,
        sessionRate: s.sessionRate,
        amountPaid: 0,
        pendingAmount: s.sessionRate,
        status: 'unpaid' as const,
      })),
      profilePicture: memberData.profilePicture as string,
      photoPath: memberData.photoPath ?? undefined,
    };
    return { status: memberResponse.status, data: transformedData };
  }

  // Fallback to transaction API for recurring
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
  const response = await api.get<OnboardingMemberListResponse>(
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
  const response = await api.get<OnboardingMemberDetailsResponse>(
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
