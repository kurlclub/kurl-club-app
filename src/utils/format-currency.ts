export const formatCurrency = (value: number | string) => {
  if (!value) return '₹0';

  const numberValue = Number(value);

  return `₹${new Intl.NumberFormat('en-IN').format(numberValue)}`;
};
