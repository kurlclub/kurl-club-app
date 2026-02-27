import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  KFormField,
  KFormFieldType,
} from '@/components/shared/form/k-formfield';
import { DocumentPreviewModal } from '@/components/shared/modals/document-preview-modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { API_BASE_URL, cn } from '@/lib/utils';
import { useGymBranch } from '@/providers/gym-branch-provider';
import {
  type InvoiceSettings,
  type InvoiceTemplate,
  getInvoiceSettings,
  getInvoiceTemplates,
  upsertInvoiceSettings,
} from '@/services/invoice';

const invoiceSettingsSchema = z.object({
  invoicePrefix: z.string().min(1, 'Invoice prefix is required'),
  invoiceStartNumber: z.string().min(1, 'Starting number is required'),
  taxRate: z.string().optional(),
  companyRegNumber: z.string().optional(),
  paymentTerms: z.string().optional(),
  invoiceTemplate: z.string().min(1, 'Template is required'),
});

type InvoiceSettingsForm = z.infer<typeof invoiceSettingsSchema>;

type TemplatePreviewAsset = {
  objectUrl: string;
  mimeType: string;
};

const buildTemplatePreviewUrl = (previewUrl: string) => {
  if (/^https?:\/\//i.test(previewUrl)) return previewUrl;

  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  const normalizedPath = previewUrl.startsWith('/')
    ? previewUrl
    : `/${previewUrl}`;

  return `${baseUrl}${normalizedPath}`;
};

export default function InvoiceSettings() {
  const { gymBranch } = useGymBranch();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [previewTemplate, setPreviewTemplate] =
    useState<InvoiceTemplate | null>(null);
  const [templatePreviewAssets, setTemplatePreviewAssets] = useState<
    Record<string, TemplatePreviewAsset>
  >({});
  const [loadingPreviewIds, setLoadingPreviewIds] = useState<
    Record<string, boolean>
  >({});
  const [previewLoadErrors, setPreviewLoadErrors] = useState<
    Record<string, boolean>
  >({});
  const templatePreviewAssetsRef = useRef<Record<string, TemplatePreviewAsset>>(
    {}
  );

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

  useEffect(() => {
    templatePreviewAssetsRef.current = templatePreviewAssets;
  }, [templatePreviewAssets]);

  useEffect(() => {
    return () => {
      Object.values(templatePreviewAssetsRef.current).forEach((asset) => {
        URL.revokeObjectURL(asset.objectUrl);
      });
    };
  }, []);

  const loadTemplatePreviewAsset = useCallback(
    async (template: InvoiceTemplate, showToastOnError = false) => {
      const cachedPreview = templatePreviewAssetsRef.current[template.id];
      if (cachedPreview) return cachedPreview;

      setLoadingPreviewIds((prev) => ({ ...prev, [template.id]: true }));

      try {
        const accessToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;
        const previewUrl = buildTemplatePreviewUrl(template.previewUrl);
        let response: Response;

        try {
          response = await fetch(previewUrl, {
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : undefined,
            credentials: 'include',
          });
        } catch {
          response = await fetch(previewUrl, {
            credentials: 'include',
          });
        }

        if (!response.ok && accessToken) {
          response = await fetch(previewUrl, {
            credentials: 'include',
          });
        }

        if (!response.ok) {
          throw new Error(
            `Preview request failed with status ${response.status}`
          );
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const previewAsset: TemplatePreviewAsset = {
          objectUrl,
          mimeType: blob.type || '',
        };

        setTemplatePreviewAssets((prev) => {
          const existingAsset = prev[template.id];
          if (existingAsset) {
            URL.revokeObjectURL(objectUrl);
            return prev;
          }

          return {
            ...prev,
            [template.id]: previewAsset,
          };
        });
        setPreviewLoadErrors((prev) => ({ ...prev, [template.id]: false }));

        return previewAsset;
      } catch (error) {
        console.error(
          `Error loading preview for template ${template.id}:`,
          error
        );
        setPreviewLoadErrors((prev) => ({ ...prev, [template.id]: true }));
        if (showToastOnError) {
          toast.error('Failed to load template preview');
        }
        return null;
      } finally {
        setLoadingPreviewIds((prev) => ({ ...prev, [template.id]: false }));
      }
    },
    []
  );

  // Fetch available invoice templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoadingTemplates(true);
      try {
        const data = await getInvoiceTemplates();
        setTemplates(data);
        // Set first template as default if available
        if (data.length > 0 && !form.getValues('invoiceTemplate')) {
          setSelectedTemplate(data[0].id);
          form.setValue('invoiceTemplate', data[0].id);
        }
      } catch (error) {
        console.error('Error loading invoice templates:', error);
        toast.error('Failed to load invoice templates');
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, [form]);

  // Prefill invoice settings if available
  useEffect(() => {
    const fetchSettings = async () => {
      if (!gymBranch?.gymId) return;

      setIsLoadingSettings(true);
      try {
        const settings = await getInvoiceSettings(gymBranch.gymId);
        if (!settings) return;

        form.reset({
          invoicePrefix: settings.invoicePrefix ?? 'INV',
          invoiceStartNumber: String(settings.invoiceStartingNumber ?? 1001),
          taxRate:
            settings.taxRate === 0 || settings.taxRate
              ? String(settings.taxRate)
              : '',
          companyRegNumber: settings.taxRegistrationNumber ?? '',
          paymentTerms: settings.paymentTerms ?? '',
          invoiceTemplate: settings.invoiceTemplate ?? 'modern',
        });

        setSelectedTemplate(settings.invoiceTemplate ?? 'modern');
      } catch (error) {
        console.error('Error loading invoice settings:', error);
        toast.error('Failed to load invoice settings');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, [gymBranch?.gymId, form]);

  useEffect(() => {
    if (templates.length === 0) return;

    void Promise.allSettled(
      templates.map((template) => loadTemplatePreviewAsset(template))
    );
  }, [templates, loadTemplatePreviewAsset]);

  const onSubmit = async (data: InvoiceSettingsForm) => {
    if (!gymBranch?.gymId) {
      toast.error('No gym selected');
      return;
    }

    const invoiceStartingNumber = Number(data.invoiceStartNumber);
    const taxRate = data.taxRate ? Number(data.taxRate) : 0;

    const payload: InvoiceSettings = {
      gymId: gymBranch.gymId,
      invoicePrefix: data.invoicePrefix,
      invoiceStartingNumber: Number.isFinite(invoiceStartingNumber)
        ? invoiceStartingNumber
        : 0,
      taxRate: Number.isFinite(taxRate) ? taxRate : 0,
      taxRegistrationNumber: data.companyRegNumber ?? '',
      paymentTerms: data.paymentTerms ?? '',
      invoiceTemplate: data.invoiceTemplate,
    };

    try {
      const result = await upsertInvoiceSettings(payload);
      toast.success(result.success);
      setSelectedTemplate(result.data.invoiceTemplate);
      form.reset({
        invoicePrefix: result.data.invoicePrefix,
        invoiceStartNumber: String(result.data.invoiceStartingNumber),
        taxRate: String(result.data.taxRate ?? 0),
        companyRegNumber: result.data.taxRegistrationNumber ?? '',
        paymentTerms: result.data.paymentTerms ?? '',
        invoiceTemplate: result.data.invoiceTemplate,
      });
    } catch (error) {
      console.error('Error saving invoice settings:', error);
      toast.error('Failed to save invoice settings');
    }
  };

  const handlePreviewTemplate = (template: InvoiceTemplate) => {
    setPreviewTemplate(template);
    void loadTemplatePreviewAsset(template, true);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    form.setValue('invoiceTemplate', templateId, {
      shouldDirty: true,
    });
  };

  const isDirty = form.formState.isDirty;
  const activePreviewAsset = previewTemplate
    ? templatePreviewAssets[previewTemplate.id]
    : null;
  const isPreviewLoading = Boolean(
    previewTemplate &&
    loadingPreviewIds[previewTemplate.id] &&
    !templatePreviewAssets[previewTemplate.id]
  );
  const hasPreviewError = Boolean(
    previewTemplate && previewLoadErrors[previewTemplate.id]
  );

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
                disabled={isLoadingSettings}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoadingSettings}
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
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading templates...
                  </p>
                </div>
              ) : templates.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No templates available
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {templates.map((template) => {
                    const templatePreviewAsset =
                      templatePreviewAssets[template.id];
                    const templatePreviewUrl =
                      templatePreviewAsset?.objectUrl ?? '';
                    const isTemplatePreviewLoading = Boolean(
                      loadingPreviewIds[template.id] && !templatePreviewUrl
                    );
                    const hasTemplatePreviewError = Boolean(
                      previewLoadErrors[template.id]
                    );

                    return (
                      <div
                        key={template.id}
                        className={cn(
                          'relative border-2 rounded-lg overflow-hidden transition-all group',
                          selectedTemplate === template.id
                            ? 'border-primary-green-500 bg-primary-green-50 dark:bg-primary-green-900/20'
                            : 'border-gray-200 dark:border-secondary-blue-400 bg-white dark:bg-secondary-blue-500/30'
                        )}
                      >
                        {/* Selection Checkmark */}
                        {selectedTemplate === template.id && (
                          <div className="absolute top-2 right-2 bg-primary-green-800 rounded-full p-1 z-10">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}

                        {/* Template Preview Image */}
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`Select ${template.name} invoice template`}
                          aria-pressed={selectedTemplate === template.id}
                          onClick={() => {
                            handleSelectTemplate(template.id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              handleSelectTemplate(template.id);
                            }
                          }}
                          className="w-full cursor-pointer"
                        >
                          <div className="aspect-3/4 bg-gray-100 dark:bg-secondary-blue-400 rounded-t mb-2 overflow-hidden relative">
                            {templatePreviewUrl ? (
                              <iframe
                                src={templatePreviewUrl}
                                className="w-full h-full border-0 pointer-events-none scale-50 origin-top-left"
                                title={`${template.name} template thumbnail`}
                                style={{ width: '200%', height: '200%' }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 px-3 text-center">
                                {isTemplatePreviewLoading
                                  ? 'Loading preview...'
                                  : hasTemplatePreviewError
                                    ? 'Preview unavailable'
                                    : 'Preparing preview...'}
                              </div>
                            )}
                            {/* Preview Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewTemplate(template);
                                }}
                                className="gap-2 pointer-events-auto"
                              >
                                <Eye className="h-4 w-4" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Template Name */}
                        <div className="px-3 pb-3">
                          <p className="font-medium text-sm text-gray-900 dark:text-white text-center">
                            {template.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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

      <DocumentPreviewModal
        open={Boolean(previewTemplate)}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTemplate(null);
          }
        }}
        documentUrl={activePreviewAsset?.objectUrl ?? ''}
        title={
          previewTemplate
            ? `${previewTemplate.name} Template Preview`
            : 'Invoice Template Preview'
        }
        isLoading={isPreviewLoading}
        emptyMessage={
          hasPreviewError
            ? 'Unable to load this template preview.'
            : 'Preview is unavailable.'
        }
      />
    </Card>
  );
}
