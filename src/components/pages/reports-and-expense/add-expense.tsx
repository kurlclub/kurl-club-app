'use client';

import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

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

type SelectOption = { label: string; value: string };

const EXPENSE_CATEGORY_OPTIONS: SelectOption[] = [
  { label: 'Communications', value: 'Communications' },
  { label: 'Staff Salaries', value: 'Staff Salaries' },
  { label: 'Food and Beverages', value: 'Food and Beverages' },
  { label: 'Rent', value: 'Rent' },
  { label: 'Entertainment', value: 'Entertainment' },
  { label: 'Insurance', value: 'Insurance' },
  { label: 'Equipment Maintenance', value: 'Equipment Maintenance' },
];

const EXPENSE_ROLE_OPTIONS: SelectOption[] = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Trainer', value: 'Trainer' },
  { label: 'Staff', value: 'Staff' },
];

const ENTRY_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

type AddExpenseProps = {
  isOpen: boolean;
  closeSheet: () => void;
};

type ExpenseFormState = {
  entryType: 'expense' | 'income';
  category: string;
  amount: string;
  expenseDate: string;
  paidBy: string;
  description: string;
};

type ExpenseFormValues = ExpenseFormState;

type AttachmentItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

const createInitialValues = (): ExpenseFormValues => ({
  entryType: 'expense',
  category: 'Communications',
  amount: '',
  expenseDate: new Date().toISOString().split('T')[0],
  paidBy: 'Admin',
  description: '',
});

const AddExpense = ({ isOpen, closeSheet }: AddExpenseProps) => {
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const form = useForm<ExpenseFormValues>({
    defaultValues: createInitialValues(),
  });

  const resetAttachments = () => {
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
    form.reset(createInitialValues());
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

  const handleSubmit = (values: ExpenseFormValues) => {
    if (!values.amount || !values.expenseDate || !values.description.trim()) {
      toast.error('Please fill all required fields');

      return;
    }

    toast.success('Expense captured in the sidebar form');
    handleReset();
    closeSheet();
  };

  const footer = (
    <div className="flex w-full items-center justify-between gap-3">
      <Button
        type="button"
        variant="secondary"
        className="h-[46px]"
        onClick={handleReset}
      >
        Reset
      </Button>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="h-[46px] min-w-[90px]"
          onClick={() => {
            handleReset();
            closeSheet();
          }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="add-expense-form"
          className="h-[46px] min-w-[110px]"
        >
          Add expense
        </Button>
      </div>
    </div>
  );

  return (
    <KSheet
      className="w-[500px]"
      isOpen={isOpen}
      onClose={closeSheet}
      title="Add expenses"
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
              name="category"
              label="Category"
              options={EXPENSE_CATEGORY_OPTIONS}
            />
          </div>

          {/* Amount / Date / Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            <KFormField
              fieldType={KFormFieldType.SELECT}
              control={form.control}
              name="paidBy"
              label="Paid by"
              options={EXPENSE_ROLE_OPTIONS}
            />
          </div>

          {/* Description */}
          <KFormField
            fieldType={KFormFieldType.TEXTAREA}
            control={form.control}
            name="description"
            label="Description"
          />

          {/* Attachments */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="expense-attachments">Attachments</Label>

            <Input
              id="expense-attachments"
              ref={attachmentInputRef}
              type="file"
              multiple
              onChange={handleAttachmentChange}
              className="h-12 border-primary-blue-400 bg-primary-blue-400/20 text-white
      file:mr-4 file:rounded-md file:border-0 file:bg-primary-blue-500
      file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />

            <p className="text-sm text-primary-blue-100">
              {attachments.length > 0
                ? `${attachments.length} file(s) selected`
                : 'Attach receipts or invoices if needed.'}
            </p>

            {attachments.length > 0 && (
              <div className="grid gap-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-3 rounded-lg
            border border-primary-blue-400/50 bg-primary-blue-400/10 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-primary-blue-400/50 bg-secondary-blue-500">
                        {attachment.previewUrl ? (
                          <Image
                            width={100}
                            height={100}
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
