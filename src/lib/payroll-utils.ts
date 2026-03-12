export const getEmployeeTypeFromRole = (role: string): 'trainer' | 'staff' => {
  return role.toLowerCase().includes('trainer') ? 'trainer' : 'staff';
};

export const getPaymentMonth = (date: Date = new Date()): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const formatPaymentDateTime = (date: Date = new Date()) => {
  return {
    formattedDate: date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    formattedTime: date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
  };
};

export const formatPaymentMonthLabel = (
  paymentMonth?: string,
  fallbackDate: Date = new Date()
): string => {
  if (paymentMonth) {
    const [year, month] = paymentMonth.split('-').map(Number);
    if (Number.isFinite(year) && Number.isFinite(month)) {
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    }
  }

  return fallbackDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const calculateTotalAmount = (items: { salary: number }[]): number => {
  return items.reduce((sum, item) => sum + (item.salary || 0), 0);
};
