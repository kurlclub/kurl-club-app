import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

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

export interface Expense {
  id: number;
  gymId: number;
  expenseCategoryId: number;
  amount: number;
  expenseDate: string;
  receiptPath: string | null;
  status: string;
  notes: string | null;
  createdBy: number;
  createdAt: string;
  modifiedAt: string;
  type: 'expense' | 'income' | null;
  isFileAttached?: boolean;
  gymName: string;
  categoryName: string;
  createdByName: string | null;
  createdByRole?: string | null;
}

export interface ExpenseFilterCategory {
  value: string;
  label: string;
  count?: number;
}

export interface ExpenseAppliedFilters {
  search: string | null;
  categoryId: number | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ExpenseAvailableFilters {
  categories?: ExpenseFilterCategory[];
  Categories?: ExpenseFilterCategory[];
  dateRange?: {
    minDate: string | null;
    maxDate: string | null;
  };
}

export interface ExpenseSummary {
  totalExpense: number;
  totalIncome: number;
  netProfit: number;
}

export interface ExpensePagination {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ExpenseListResponse {
  status: string;
  message: string;
  data: Expense[];
  appliedFilters: ExpenseAppliedFilters;
  availableFilters: ExpenseAvailableFilters;
  summary: ExpenseSummary;
  pagination: ExpensePagination;
}

export interface CreateExpensePayload {
  gymId: number;
  expenseCategoryId: number;
  amount: number;
  expenseDate: string;
  notes?: string;
  type: 'expense' | 'income';
  receiptFiles?: File[];
}

export interface UpdateExpensePayload {
  gymId: number;
  expenseCategoryId: number;
  amount: number;
  expenseDate: string;
  status?: string;
  notes?: string;
  type: 'expense' | 'income';
  receiptPath?: string;
  receiptFiles?: File[];
}

export interface GetExpensesParams {
  gymId: number;
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number | number[];
  startDate?: string;
  endDate?: string;
}

const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: GetExpensesParams) =>
    [...expenseKeys.lists(), params] as const,
  infiniteLists: () => [...expenseKeys.all, 'infinite-list'] as const,
  infiniteList: (params: Omit<GetExpensesParams, 'page'>) =>
    [...expenseKeys.infiniteLists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: number, gymId: number) =>
    [...expenseKeys.details(), id, gymId] as const,
  categories: () => [...expenseKeys.all, 'categories'] as const,
};

const getRequiredExpenseData = <T>(
  response: ApiResponse<T>,
  fallback: string
): T => {
  if (!response.data) {
    throw new Error(response.message || fallback);
  }

  return response.data;
};

const buildExpenseQueryString = (params: GetExpensesParams): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => queryParams.append(key, String(item)));
      return;
    }

    queryParams.append(key, String(value));
  });

  return queryParams.toString();
};

export const fetchExpenseCategories = async (): Promise<ExpenseCategory[]> => {
  const response = await api.get<ApiResponse<ExpenseCategory[]>>(
    '/Revenue/categories'
  );

  return response.data ?? [];
};

export const fetchExpenses = async (
  params: GetExpensesParams
): Promise<ExpenseListResponse> => {
  const queryString = buildExpenseQueryString(params);
  return api.get<ExpenseListResponse>(`/Revenue/expenses?${queryString}`);
};

export const fetchExpenseById = async (
  id: number,
  gymId: number
): Promise<Expense> => {
  const response = await api.get<ApiResponse<Expense>>(
    `/Revenue/expenses/${id}?gymId=${gymId}`
  );

  return getRequiredExpenseData(response, 'Expense not found.');
};

export const createExpense = async (
  payload: CreateExpensePayload
): Promise<Expense> => {
  const formData = new FormData();
  formData.append('GymId', String(payload.gymId));
  formData.append('ExpenseCategoryId', String(payload.expenseCategoryId));
  formData.append('Amount', String(payload.amount));
  formData.append('ExpenseDate', payload.expenseDate);
  formData.append('Type', payload.type);
  if (payload.notes?.trim()) {
    formData.append('Notes', payload.notes.trim());
  }

  payload.receiptFiles?.forEach((file) => {
    formData.append('ReceiptFiles', file);
  });

  const response = await api.post<ApiResponse<Expense>>(
    '/Revenue/expenses',
    formData
  );

  return getRequiredExpenseData(
    response,
    'Expense created but no data returned.'
  );
};

export const updateExpense = async (
  id: number,
  payload: UpdateExpensePayload
): Promise<Expense> => {
  const formData = new FormData();
  formData.append('GymId', String(payload.gymId));
  formData.append('ExpenseCategoryId', String(payload.expenseCategoryId));
  formData.append('Amount', String(payload.amount));
  formData.append('ExpenseDate', payload.expenseDate);
  formData.append('Type', payload.type);
  if (payload.status) formData.append('Status', payload.status);
  if (payload.notes?.trim()) formData.append('Notes', payload.notes.trim());
  if (payload.receiptPath !== undefined) {
    formData.append('ReceiptPath', payload.receiptPath);
  }

  payload.receiptFiles?.forEach((file) => {
    formData.append('ReceiptFiles', file);
  });

  const response = await api.put<ApiResponse<Expense>>(
    `/Revenue/expenses/${id}`,
    formData
  );

  return getRequiredExpenseData(
    response,
    'Expense updated but no data returned.'
  );
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/Revenue/expenses/${id}`);
};

export const useExpenseCategories = () => {
  return useQuery({
    queryKey: expenseKeys.categories(),
    queryFn: fetchExpenseCategories,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
};

export const useExpenses = (params: GetExpensesParams) => {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => fetchExpenses(params),
    enabled: !!params.gymId,
  });
};

export const useInfiniteExpenses = (
  params: Omit<GetExpensesParams, 'page'>
) => {
  return useInfiniteQuery({
    queryKey: expenseKeys.infiniteList(params),
    queryFn: ({ pageParam = 1 }) =>
      fetchExpenses({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!params.gymId,
  });
};

export const useExpenseById = (id: number, gymId: number) => {
  return useQuery({
    queryKey: expenseKeys.detail(id, gymId),
    queryFn: () => fetchExpenseById(id, gymId),
    enabled: !!id && !!gymId,
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.infiniteLists() });
      queryClient.invalidateQueries({ queryKey: ['reports-and-expenses'] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExpensePayload }) =>
      updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.infiniteLists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.details() });
      queryClient.invalidateQueries({ queryKey: ['reports-and-expenses'] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.infiniteLists() });
      queryClient.invalidateQueries({ queryKey: ['reports-and-expenses'] });
    },
  });
};
