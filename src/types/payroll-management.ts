export type PayrollSummary = {
  totalPaid: number;
  totalUnpaid: number;
  paidCount: number;
  unpaidCount: number;
  totalEmployees: number;
};

export type PayrollEmployee = {
  id: number;
  identifier: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  salary: number;
  photoPath?: string | null;
  paidTotal: number;
  lastPaidDate: string | null;
  isPaid: boolean;
  isSalaryConfigured: boolean;
};

export type PayrollDashboard = {
  paymentMonth: string;
  summary: PayrollSummary;
  employees: PayrollEmployee[];
};

export type PayrollRow = {
  id: number;
  staffId: string;
  name: string;
  role: 'Trainer' | 'Staff' | 'Admin' | string;
  roleKey: 'trainer' | 'staff';
  feeStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  imageUrl?: string | null;
  salary: number;
  paidTotal: number;
  lastPaidDate?: string | null;
  isPaid: boolean;
  isSalaryConfigured: boolean;
};

export type PaymentItem = {
  id: number;
  staffId: string;
  name: string;
  role: string;
  roleKey: 'trainer' | 'staff';
  salary: number;
  imageUrl?: string | null;
};

export type PaymentPayload = {
  items: PaymentItem[];
  totalAmount: number;
};

export type SelectablePaymentItem = PaymentItem & {
  selected: boolean;
};

export type PaySalaryPayload = {
  gymId: number;
  employeeType: 'staff' | 'trainer';
  employeeId: number;
  amount: number;
  paymentDate: Date;
  paymentMonth: string;
  paidBy: number;
};

export type PaySalaryResponse = {
  salaryPaymentId: number;
  expenseId: number;
  employeeId: number;
  employeeType: string;
  employeeName: string;
  amount: number;
  paymentDate: string;
  paymentMonth: string;
};
