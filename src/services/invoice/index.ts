import { api } from '@/lib/api';

export interface InvoiceTemplate {
  id: string;
  name: string;
  previewUrl: string;
  htmlPath: string;
}

interface InvoiceTemplatesResponse {
  status: string;
  message: string;
  data: InvoiceTemplate[];
}

export interface InvoiceSettings {
  gymId: number;
  invoicePrefix: string;
  invoiceStartingNumber: number;
  taxRate: number;
  taxRegistrationNumber: string;
  paymentTerms: string;
  invoiceTemplate: string;
}

interface InvoiceSettingsResponse {
  status: string;
  message: string;
  data: InvoiceSettings;
}

export const getInvoiceTemplates = async () => {
  try {
    const response =
      await api.get<InvoiceTemplatesResponse>('/Invoice/templates');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    throw error;
  }
};

export const getInvoiceSettings = async (
  gymId: number
): Promise<InvoiceSettings | null> => {
  try {
    const response = await api.get<InvoiceSettingsResponse>(
      `/Invoice/settings/${gymId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    const httpError = error as { response?: { status?: number } };
    if (httpError?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const upsertInvoiceSettings = async (settings: InvoiceSettings) => {
  try {
    const response = await api.post<InvoiceSettingsResponse>(
      '/Invoice/settings',
      settings
    );
    return {
      success: response.message || 'Invoice settings updated successfully',
      data: response.data,
    };
  } catch (error) {
    console.error('Error updating invoice settings:', error);
    throw error;
  }
};
