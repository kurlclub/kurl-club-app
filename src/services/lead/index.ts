import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ApiResponse } from '@/types';
import type { InterestStatus, LeadSource } from '@/types/lead';
import type { StaffType } from '@/types/staff';

export type CreateLeadPayload = {
  name: string;
  phone: string;
  source: LeadSource;
  status: InterestStatus;
  notes: string;
  followUpDate?: string;
  assignedToUserId?: number;
  assignedToUserType?: StaffType;
};

export type LeadApiItem = {
  id: number;
  gymId: number;
  name: string;
  phone?: string;
  source?: string;
  status?: string;
  notes?: string;
  followUpDate?: string;
  assignedToUserId?: number;
  assignedToUserName?: string;
  assignedToUserType?: string;
  createdAt: string;
  updatedAt?: string;
};

export const fetchLeads = async (gymId: number): Promise<LeadApiItem[]> => {
  const response = await api.get<ApiResponse<LeadApiItem[]>>(`/Lead/${gymId}`);
  return response.data || [];
};

export const createLead = async (
  gymId: number,
  payload: CreateLeadPayload
): Promise<ApiResponse> => {
  return api.post<ApiResponse>(`/Lead/${gymId}`, payload);
};

export const updateLead = async (
  gymId: number,
  leadId: number,
  payload: CreateLeadPayload
): Promise<ApiResponse> => {
  return api.put<ApiResponse>(`/Lead/${gymId}/${leadId}`, payload);
};

export const deleteLead = async (
  gymId: number,
  leadId: number
): Promise<ApiResponse> => {
  return api.delete(
    `/Lead/${gymId}/${leadId}`
  ) as unknown as Promise<ApiResponse>;
};

export const useLeads = (gymId?: number) => {
  return useQuery({
    queryKey: ['leads', gymId],
    queryFn: () => fetchLeads(gymId!),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 2,
  });
};
