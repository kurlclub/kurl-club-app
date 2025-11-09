import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface PaymentRequest {
  memberId: number;
  gymId: number;
  membershipPlanId: number;
  amount: number;
  paymentMethod: string;
  paymentType: number;
}

export interface ExtendBufferRequest {
  memberId: number;
  daysToAdd: number;
}

export interface PaymentHistory {
  id: number;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  paymentType: number;
  isEdited: boolean;
  originalPaymentId: number | null;
  status: string;
}

export const partialPayment = async (data: PaymentRequest) => {
  try {
    const response = await api.post('/Transaction/partial-payment', data);
    return {
      success: 'Partial payment recorded successfully!',
      data: response,
    };
  } catch (error) {
    console.error('Error recording partial payment:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to record partial payment';
    return { error: errorMessage };
  }
};

export const fullPayment = async (data: PaymentRequest) => {
  try {
    const response = await api.post('/Transaction/full-payment', data);
    return { success: 'Full payment recorded successfully!', data: response };
  } catch (error) {
    console.error('Error recording full payment:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to record full payment';
    return { error: errorMessage };
  }
};

export const extendBuffer = async (data: ExtendBufferRequest) => {
  try {
    const response = await api.post('/Transaction/extend-buffer', data);
    return { success: 'Buffer extended successfully!', data: response };
  } catch (error) {
    console.error('Error extending buffer:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to extend buffer';
    return { error: errorMessage };
  }
};

export const getPaymentHistory = async (memberId: number) => {
  try {
    const response = await api.get<ApiResponse<PaymentHistory[]>>(
      `/Transaction/payment-history/${memberId}`
    );
    return response.data || [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const exportPaymentReport = async (paymentId: number) => {
  try {
    const { blob, contentDisposition } = await api.get<{
      blob: Blob;
      contentDisposition: string | null;
    }>(`/Payment/export-report/${paymentId}`, { responseType: 'blob' });

    let filename = `PaymentReceipt_#${paymentId}.pdf`;

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(
        /filename\*=UTF-8''(.+?)(?:;|$)/
      );
      const regularMatch = contentDisposition.match(/filename=([^;]+)/);

      if (utf8Match?.[1]) {
        filename = decodeURIComponent(utf8Match[1]);
      } else if (regularMatch?.[1]) {
        filename = regularMatch[1].replace(/["']/g, '').trim();
      }
    }

    return { blob, filename };
  } catch (error) {
    console.error('Error exporting payment report:', error);
    throw error;
  }
};

export const emailPaymentReport = async (paymentId: number) => {
  try {
    const response = await api.post(`/Payment/email-report/${paymentId}`);
    return { success: 'Invoice sent successfully!', data: response };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send invoice email';
    return { error: errorMessage };
  }
};
