type Role = 'Admin' | 'Trainer' | 'Staff';

export interface ExpenseType {
  category: string;
  description: string;
  amount: string;
  time: string;
  date: string; // ISO date string (YYYY-MM-DD)
  role: Role;
  attachments: number;
}
