'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchPayrollDashboard,
  paySalary,
  upsertStaffSalary,
} from '@/services/payroll';
import type { PaySalaryPayload } from '@/types/payroll-management';

export const payrollKeys = {
  all: ['payroll'] as const,
  dashboard: (gymId: number) =>
    [...payrollKeys.all, 'dashboard', gymId] as const,
};

export const usePayrollDashboard = (gymId?: number) => {
  return useQuery({
    queryKey: payrollKeys.dashboard(gymId || 0),
    queryFn: () => fetchPayrollDashboard(gymId || 0),
    enabled: !!gymId,
    staleTime: 1000 * 60 * 2,
  });
};

export const usePaySalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PaySalaryPayload) => paySalary(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
};

export const useUpsertStaffSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      employeeId: number;
      employeeType: 'staff' | 'trainer';
      salary: number;
      salaryDay?: string;
    }) => upsertStaffSalary(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'staffSalary',
          String(variables.employeeId),
          variables.employeeType,
        ],
      });
      queryClient.invalidateQueries({ queryKey: payrollKeys.all });
    },
  });
};
