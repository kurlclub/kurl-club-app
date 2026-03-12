import { api } from '@/lib/api';
import type {
  PaySalaryPayload,
  PaySalaryResponse,
  PayrollDashboard,
} from '@/types/payroll-management';

type PayrollResponse<T> = {
  status: string;
  message?: string;
  data: T;
};

export const fetchPayrollDashboard = async (
  gymId: number
): Promise<PayrollDashboard> => {
  const response = await api.get<PayrollResponse<PayrollDashboard>>(
    `/Payroll/${gymId}/payroll-dashboard`
  );
  return response.data;
};

export const paySalary = async (
  payload: PaySalaryPayload
): Promise<PaySalaryResponse> => {
  const response = await api.post<PayrollResponse<PaySalaryResponse>>(
    `/Payroll/pay-salary`,
    {
      gymId: payload.gymId,
      employeeType: payload.employeeType,
      employeeId: payload.employeeId,
      amount: payload.amount,
      paymentDate: payload.paymentDate.toISOString(),
      paymentMonth: payload.paymentMonth,
      paidBy: payload.paidBy,
    }
  );
  return response.data;
};

export const upsertStaffSalary = async (payload: {
  employeeId: number;
  employeeType: 'staff' | 'trainer';
  salary: number;
  salaryDate: Date;
}) => {
  const response = await api.post<PayrollResponse<unknown>>(
    `/Payroll/add-salary`,
    {
      employeeId: payload.employeeId,
      employeeType: payload.employeeType,
      salary: payload.salary,
      salaryDate: payload.salaryDate.toISOString(),
    }
  );

  return response.data;
};
