import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText } from 'lucide-react';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const invoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  invoiceStartNumber: z.string().min(1, 'Starting number is required'),
  taxRate: z.string().optional(),
  companyRegNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoiceTemplate: z.string().min(1, 'Template is required'),
});

type InvoiceSettingsForm = z.infer<typeof invoiceSettingsSchema>;

const INVOICE_TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    preview: '/assets/invoice-templates/modern.png',
    description: 'Clean and minimal design',
  },
  {
    id: 'classic',
    name: 'Classic',
    preview: '/assets/invoice-templates/classic.png',
    description: 'Traditional business format',
  },
  {
    id: 'bold',
    name: 'Bold',
    preview: '/assets/invoice-templates/bold.png',
    description: 'Eye-catching with colors',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    preview: '/assets/invoice-templates/elegant.png',
    description: 'Professional and refined',
  },
];

export default function InvoiceSettings() {
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const form = useForm<InvoiceSettingsForm>({
    resolver: zodResolver(invoiceSettingsSchema),
    defaultValues: {
      invoicePrefix: 'INV',
      invoiceStartNumber: '1001',
      taxRate: '',
      companyRegNumber: '',
      paymentTerms: 'Payment due within 30 days',
      invoiceTemplate: 'modern',
    },
  });

  const onSubmit = async (data: InvoiceSettingsForm) => {
    console.log('Invoice settings:', data);
    // TODO: Implement API call
  };

  const isDirty = form.formState.isDirty;

  return (
    <Card className="bg-white dark:bg-secondary-blue-500 border-gray-200 dark:border-primary-blue-400">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary-green-600 dark:text-primary-green-500 mt-1" />
            <div>
              <CardTitle className="text-gray-900 dark:text-white">
                Invoice & Document Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-secondary-blue-200">
                Customize invoice templates and billing information
              </CardDescription>
            </div>
          </div>
          {isDirty && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.reset()}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormProvider {...form}>
          <form className="space-y-6">
            {/* Invoice Template Selection */}
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
                Invoice Template
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {INVOICE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      form.setValue('invoiceTemplate', template.id, {
                        shouldDirty: true,
                      });
                    }}
                    className={cn(
                      'relative border-2 rounded-lg p-3 text-left transition-all hover:border-primary-green-500',
                      selectedTemplate === template.id
                        ? 'border-primary-green-500 bg-primary-green-50 dark:bg-primary-green-900/20'
                        : 'border-gray-200 dark:border-secondary-blue-400 bg-white dark:bg-secondary-blue-500/30'
                    )}
                  >
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 bg-primary-green-500 rounded-full p-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="aspect-[3/4] bg-gray-100 dark:bg-secondary-blue-400 rounded mb-2 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                      {template.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Number Configuration */}
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
                Invoice Numbering
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="invoicePrefix"
                  label="Prefix"
                  placeholder="INV"
                  className="bg-gray-50 dark:bg-primary-blue-400"
                />
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="invoiceStartNumber"
                  label="Starting Number"
                  placeholder="1001"
                  className="bg-gray-50 dark:bg-primary-blue-400"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Example: INV-1001, INV-1002, INV-1003...
              </p>
            </div>

            {/* Tax & Company Details */}
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-3 block">
                Tax & Company Information
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="taxRate"
                  label="Tax Rate (%)"
                  placeholder="18"
                  className="bg-gray-50 dark:bg-primary-blue-400"
                />
                <KFormField
                  fieldType={KFormFieldType.INPUT}
                  control={form.control}
                  name="companyRegNumber"
                  label="Tax Registration Number"
                  placeholder="TAX123456789"
                  className="bg-gray-50 dark:bg-primary-blue-400"
                />
              </div>
            </div>

            {/* Payment Terms */}
            <KFormField
              fieldType={KFormFieldType.TEXTAREA}
              control={form.control}
              name="paymentTerms"
              label="Payment Terms"
              placeholder="Payment due within 30 days"
              className="bg-gray-50 dark:bg-primary-blue-400"
            />
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
