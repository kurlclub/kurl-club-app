export type PayrollRow = {
  staffId: string;
  name: string;
  role: 'Admin' | 'Trainer' | 'Staff';
  feeStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
};
