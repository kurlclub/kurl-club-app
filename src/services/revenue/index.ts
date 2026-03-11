import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  expenseCount: number;
}

export interface CreateExpensePayload {
  gymId: number;
  expenseCategoryId: number;
  amount: number;
  expenseDate: string;
  notes: string;
  type: 'expense' | 'income';
  receiptFiles?: File[];
}

export interface CreatedExpense {
  id: number;
  gymId: number;
  expenseCategoryId: number;
  amount: number;
  expenseDate: string;
  receiptPath: string | null;
  notes: string;
  createdBy: number;
  createdAt: string;
  modifiedAt: string;
  type: 'expense' | 'income';
  isFileAttached: boolean;
  gymName: string;
  categoryName: string;
  createdByName: string;
  createdByRole: string | null;
}

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get<ApiResponse<ExpenseCategory[]>>(
    '/Revenue/categories'
  );

  return response.data ?? [];
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};

export const createExpense = async (
  payload: CreateExpensePayload
): Promise<CreatedExpense> => {
  const formData = new FormData();
  formData.append('GymId', String(payload.gymId));
  formData.append('ExpenseCategoryId', String(payload.expenseCategoryId));
  formData.append('Amount', String(payload.amount));
  formData.append('ExpenseDate', payload.expenseDate);
  formData.append('ReceiptPath', '');
  formData.append('Notes', payload.notes);
  formData.append('Type', payload.type);

  payload.receiptFiles?.forEach((file) => {
    formData.append('ReceiptFiles', file);
  });

  const response = await api.post<ApiResponse<CreatedExpense>>(
    '/Revenue/expenses',
    formData
  );

  if (!response.data) {
    throw new Error(
      response.message || 'Expense created but no data returned.'
    );
  }

  return response.data;
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-and-expenses'] });
    },
  });
};
