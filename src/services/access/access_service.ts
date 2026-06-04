import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import type {
  AccessModuleDefinition,
  AccessSubjectPermission,
  AccessSubjectPermissionsResponse,
  AccessSubjectType,
  UpdateAccessSubjectPermissionsPayload,
} from '@/types/access.types';

interface AccessModulesResponse {
  status: string;
  message: string;
  data: AccessModuleDefinition[];
}

interface AccessUpdateResponse {
  status: string;
  message: string;
  data?: unknown;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeSubjectPermissions = (
  value: AccessSubjectPermissionsResponse['data'] | AccessSubjectPermission[]
) => {
  if (Array.isArray(value)) return value;

  if (isRecord(value) && Array.isArray(value.permissions)) {
    return value.permissions as AccessSubjectPermission[];
  }

  return [];
};

export const accessKeys = {
  modules: ['access-modules'] as const,
  subjectPermissions: (
    gymId: number,
    subjectType: AccessSubjectType,
    subjectId: number
  ) => ['subject-access', gymId, subjectType, subjectId] as const,
};

const getAccessModules = async () => {
  const response = await api.get<AccessModulesResponse>('/Access/modules');
  return response.data || [];
};

const getSubjectPermissions = async (
  gymId: number,
  subjectType: AccessSubjectType,
  subjectId: number
) => {
  const response = await api.get<AccessSubjectPermissionsResponse>(
    `/Access/gyms/${gymId}/${subjectType}/${subjectId}`
  );
  return normalizeSubjectPermissions(response.data);
};

const updateSubjectPermissions = async (
  gymId: number,
  subjectType: AccessSubjectType,
  subjectId: number,
  payload: UpdateAccessSubjectPermissionsPayload
) => {
  return api.put<AccessUpdateResponse>(
    `/Access/gyms/${gymId}/${subjectType}/${subjectId}`,
    payload
  );
};

export const useAccessModules = () => {
  return useQuery({
    queryKey: accessKeys.modules,
    queryFn: getAccessModules,
    staleTime: 5 * 60 * 1000,
  });
};

export const useSubjectPermissions = (
  gymId: number,
  subjectType: AccessSubjectType,
  subjectId: number
) => {
  return useQuery({
    queryKey: accessKeys.subjectPermissions(gymId, subjectType, subjectId),
    queryFn: () => getSubjectPermissions(gymId, subjectType, subjectId),
    enabled: Boolean(gymId && subjectId && subjectType),
  });
};

export const useUpdateSubjectPermissions = (
  gymId: number,
  subjectType: AccessSubjectType,
  subjectId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAccessSubjectPermissionsPayload) =>
      updateSubjectPermissions(gymId, subjectType, subjectId, payload),
    onSuccess: (_response, payload) => {
      queryClient.setQueryData(
        accessKeys.subjectPermissions(gymId, subjectType, subjectId),
        payload.permissions
      );
      queryClient.invalidateQueries({
        queryKey: accessKeys.subjectPermissions(gymId, subjectType, subjectId),
      });
    },
  });
};
