import { format, isThisYear, isToday, isYesterday, parseISO } from 'date-fns';

export function formatExpenseDate(dateString: string): string {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  // If it's from the current year, show just month and day
  if (isThisYear(date)) {
    return format(date, 'MMM dd');
  }

  // If it's from a previous year, show month, day, and year
  return format(date, 'MMM dd yyyy');
}
