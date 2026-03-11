'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { KSheet } from '@/components/shared/form/k-sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  API_BASE_URL,
  safeParseDate,
  toUtcDateOnlyISOString,
} from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  Expense,
  useCreateExpense,
  useDeleteExpense,
  useExpenseCategories,
  useUpdateExpense,
} from '@/services/revenue';

type SelectOption = { label: string; value: string };

const ENTRY_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

type AddExpenseProps = {
  isOpen: boolean;
  closeSheet: () => void;
  expenseToEdit?: Expense | null;
};

type ExpenseFormState = {
  entryType: 'expense' | 'income';
  categoryId: string;
  amount: string;
  expenseDate: string;
  description: string;
};

type ExpenseFormValues = ExpenseFormState;

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type ExistingAttachmentItem = {
  id: string;
  path: string;
};

const createInitialValues = (categoryId = ''): ExpenseFormValues => ({
  entryType: 'expense',
  categoryId,
  amount: '',
  expenseDate: new Date().toISOString().split('T')[0],
  description: '',
});

const isImageFilePath = (path: string) => {
  const normalizedPath = path.toLowerCase();
  return (
    normalizedPath.endsWith('.png') ||
    normalizedPath.endsWith('.jpg') ||
    normalizedPath.endsWith('.jpeg') ||
    normalizedPath.endsWith('.gif') ||
    normalizedPath.endsWith('.webp') ||
    normalizedPath.includes('image')
  );
};

const extractFileName = (path: string) => {
  const decodedPath = decodeURIComponent(path);
  return decodedPath.split('/').pop() || 'Attachment';
};

const toReceiptUrl = (path: string) => {
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
};

const toDateInputValue = (dateValue: string) => {
  const parsed = safeParseDate(dateValue);
  if (!parsed) {
    return new Date().toISOString().split('T')[0];
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseReceiptPaths = (
  receiptPath?: string | null
): ExistingAttachmentItem[] => {
  if (!receiptPath) return [];

  return receiptPath
    .split(',')
    .map((path) => path.trim())
    .filter(Boolean)
    .map((path, index) => ({
      id: `${path}-${index}`,
      path,
    }));
};

const AddExpense = ({ isOpen, closeSheet, expenseToEdit }: AddExpenseProps) => {
  const { gymBranch } = useGymBranch();
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useExpenseCategories();
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    ExistingAttachmentItem[]
  >([]);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = !!expenseToEdit;
  const availableCategories = useMemo(() => categories, [categories]);
  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      availableCategories.map((category) => ({
        label: category.name,
        value: String(category.id),
      })),
    [availableCategories]
  );
  const defaultCategoryId =
    availableCategories.find((category) => category.isDefault)?.id ??
    availableCategories[0]?.id;
  const form = useForm<ExpenseFormValues>({
    defaultValues: createInitialValues(),
  });
  const selectedCategoryId = useWatch({
    control: form.control,
    name: 'categoryId',
  });

  useEffect(() => {
    if (!defaultCategoryId) return;

    const currentCategoryId = form.getValues('categoryId');
    const hasSelectedCategory = availableCategories.some(
      (category) => String(category.id) === currentCategoryId
    );

    if (!hasSelectedCategory) {
      form.setValue('categoryId', String(defaultCategoryId), {
        shouldDirty: false,
      });
    }
  }, [availableCategories, defaultCategoryId, form]);

  const clearNewAttachments = () => {
    setAttachments((current) => {
      current.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });

      return [];
    });

    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const resetAttachments = () => {
    clearNewAttachments();
    setExistingAttachments([]);
  };

  useEffect(() => {
    return () => {
      attachments.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [attachments]);

  const handleReset = () => {
    if (isEditMode && expenseToEdit) {
      form.reset({
        entryType: (expenseToEdit.type || 'expense') as 'expense' | 'income',
        categoryId: String(expenseToEdit.expenseCategoryId),
        amount: String(expenseToEdit.amount),
        expenseDate: toDateInputValue(expenseToEdit.expenseDate),
        description: expenseToEdit.notes || '',
      });
      clearNewAttachments();
      setExistingAttachments(parseReceiptPaths(expenseToEdit.receiptPath));
      return;
    }

    form.reset(
      createInitialValues(defaultCategoryId ? String(defaultCategoryId) : '')
    );
    resetAttachments();
  };

  const handleAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const nextItems: AttachmentItem[] = selectedFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      previewUrl: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
    }));

    setAttachments((current) => [...current, ...nextItems]);

    // Allow selecting the same file again in a later pick.
    event.target.value = '';
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === attachmentId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== attachmentId);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectedCategory = availableCategories.find(
    (category) => String(category.id) === selectedCategoryId
  );

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!gymBranch?.gymId) {
      toast.error('Please select a gym before adding an expense');

      return;
    }

    if (!values.amount || !values.expenseDate || !values.categoryId) {
      toast.error('Please fill all required fields');

      return;
    }

    const parsedAmount = Number(values.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Enter a valid expense amount');

      return;
    }

    const expenseDate = toUtcDateOnlyISOString(values.expenseDate);
    if (!expenseDate) {
      toast.error('Enter a valid expense date');

      return;
    }

    try {
      if (isEditMode && expenseToEdit) {
        const updatedExpense = await updateExpenseMutation.mutateAsync({
          id: expenseToEdit.id,
          data: {
            gymId: gymBranch.gymId,
            expenseCategoryId: Number(values.categoryId),
            amount: parsedAmount,
            expenseDate,
            notes: values.description.trim() || undefined,
            type: values.entryType,
            receiptPath: existingAttachments.map((item) => item.path).join(','),
            receiptFiles: attachments.map((attachment) => attachment.file),
          },
        });

        toast.success(
          `${updatedExpense.categoryName} ${updatedExpense.type} updated successfully`
        );
      } else {
        const createdExpense = await createExpenseMutation.mutateAsync({
          gymId: gymBranch.gymId,
          expenseCategoryId: Number(values.categoryId),
          amount: parsedAmount,
          expenseDate,
          notes: values.description.trim() || undefined,
          type: values.entryType,
          receiptFiles: attachments.map((attachment) => attachment.file),
        });

        toast.success(
          `${createdExpense.categoryName} ${createdExpense.type} created successfully`
        );
      }

      handleReset();
      closeSheet();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create expense'
      );
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToEdit) return;

    const confirmed = window.confirm(
      'Delete this expense entry? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await deleteExpenseMutation.mutateAsync(expenseToEdit.id);
      toast.success('Expense deleted successfully');
      handleReset();
      closeSheet();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete expense'
      );
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    if (expenseToEdit) {
      form.reset({
        entryType: (expenseToEdit.type || 'expense') as 'expense' | 'income',
        categoryId: String(expenseToEdit.expenseCategoryId),
        amount: String(expenseToEdit.amount),
        expenseDate: toDateInputValue(expenseToEdit.expenseDate),
        description: expenseToEdit.notes || '',
      });
      const timeoutId = window.setTimeout(() => {
        clearNewAttachments();
        setExistingAttachments(parseReceiptPaths(expenseToEdit.receiptPath));
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    form.reset(
      createInitialValues(defaultCategoryId ? String(defaultCategoryId) : '')
    );
    const timeoutId = window.setTimeout(() => {
      clearNewAttachments();
      setExistingAttachments([]);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [defaultCategoryId, expenseToEdit, form, isOpen]);

  const footer = (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {isEditMode && (
          <Button
            type="button"
            variant="destructive"
            className="h-11.5"
            onClick={handleDeleteExpense}
            disabled={
              deleteExpenseMutation.isPending || updateExpenseMutation.isPending
            }
          >
            {deleteExpenseMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          className="h-11.5"
          onClick={handleReset}
          disabled={
            createExpenseMutation.isPending || updateExpenseMutation.isPending
          }
        >
          Reset
        </Button>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="h-11.5 min-w-22.5"
          onClick={() => {
            handleReset();
            closeSheet();
          }}
          disabled={
            createExpenseMutation.isPending ||
            updateExpenseMutation.isPending ||
            deleteExpenseMutation.isPending
          }
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-expense-form"
          className="h-11.5 min-w-27.5"
          disabled={
            createExpenseMutation.isPending ||
            updateExpenseMutation.isPending ||
            isCategoriesLoading ||
            !gymBranch?.gymId
          }
        >
          {createExpenseMutation.isPending || updateExpenseMutation.isPending
            ? 'Saving...'
            : isEditMode
              ? 'Save changes'
              : 'Add expense'}
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-125"
      isOpen={isOpen}
      onClose={closeSheet}
      title={isEditMode ? 'Edit expense' : 'Add expenses'}
      onCloseBtnClick={() => {
        handleReset();
        closeSheet();
      }}
      footer={footer}
    >
      <Form {...form}>
        <form
          id="add-expense-form"
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit(handleSubmit)(e);
          }}
        >
          {/* Entry Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="entryType"
              label="Type"
              options={ENTRY_TYPE_OPTIONS}
            />

            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="categoryId"
              label="Category"
              options={categoryOptions}
            />
          </div>

          {selectedCategory?.description && (
            <div className="rounded-xl border border-primary-blue-400/50 bg-primary-blue-400/10 px-4 py-3 text-sm text-primary-blue-100">
              {selectedCategory.description}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <KFormField
              fieldType={KFormFieldType.INPUT}
              control={form.control}
              name="amount"
              label="Amount"
              type="number"
            />

            <KFormField
              fieldType={KFormFieldType.DATE_INPUT}
              control={form.control}
              name="expenseDate"
              label="Expense date"
            />
          </div>

          <KFormField
            fieldType={KFormFieldType.TEXTAREA}
            control={form.control}
            name="description"
            label="Notes"
          />

          <div className="flex flex-col gap-3">
            <Label htmlFor="expense-attachments">Attachments</Label>

            <Input
              id="expense-attachments"
              ref={attachmentInputRef}
              type="file"
              multiple
              onChange={handleAttachmentChange}
              disabled={
                createExpenseMutation.isPending ||
                updateExpenseMutation.isPending
              }
              className="h-12 border-primary-blue-400 bg-primary-blue-400/20 text-white
      file:mr-4 file:rounded-md file:border-0 file:bg-primary-blue-500
      file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <p className="text-sm text-primary-blue-100">
              {attachments.length + existingAttachments.length > 0
                ? `${attachments.length + existingAttachments.length} file(s) selected`
                : 'Attach receipts or invoices if needed.'}
            </p>

            {(existingAttachments.length > 0 || attachments.length > 0) && (
              <div className="grid gap-2">
                {existingAttachments.map((attachment) => {
                  const receiptUrl = toReceiptUrl(attachment.path);

                  return (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-lg
            border border-primary-blue-400/50 bg-primary-blue-400/10 p-3"
                    >
                      <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 min-w-0 hover:opacity-80"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-primary-blue-400/50 bg-secondary-blue-500">
                          {isImageFilePath(attachment.path) ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={receiptUrl}
                              alt={extractFileName(attachment.path)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary-blue-100">
                              FILE
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">
                            {extractFileName(attachment.path)}
                          </p>
                          <p className="text-xs text-primary-blue-100">
                            Existing attachment
                          </p>
                        </div>
                      </a>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setExistingAttachments((current) =>
                            current.filter((item) => item.id !== attachment.id)
                          )
                        }
                        disabled={
                          createExpenseMutation.isPending ||
                          updateExpenseMutation.isPending
                        }
                        className="text-alert-red-400 hover:text-alert-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-lg
            border border-primary-blue-400/50 bg-primary-blue-400/10 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-primary-blue-400/50 bg-secondary-blue-500">
                        {attachment.previewUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={attachment.previewUrl}
                            alt={attachment.file.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-primary-blue-100">
                            FILE
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">
                          {attachment.file.name}
                        </p>
                        <p className="text-xs text-primary-blue-100">
                          {formatFileSize(attachment.file.size)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      disabled={
                        createExpenseMutation.isPending ||
                        updateExpenseMutation.isPending
                      }
                      className="text-alert-red-400 hover:text-alert-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Form>
    </KSheet>
  );
};

export default AddExpense;
