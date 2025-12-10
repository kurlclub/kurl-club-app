import { DateRange } from 'react-day-picker';

import { type ClassValue, clsx } from 'clsx';
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';
import { twMerge } from 'tailwind-merge';

// Payment-related types
export type PaymentBadgeStatus =
  | 'paid'
  | 'partially_paid'
  | 'pending'
  | 'overdue';
export type UrgencyColor = 'red' | 'orange' | 'yellow' | 'green';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

/**
 * Merges multiple class names conditionally and removes duplicates.
 *
 * @param inputs - An array of class values.
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates a date range based on a preset string.
 *
 * @param preset - A string representing the desired date range preset (e.g., "Today", "This Week").
 * @returns A `DateRange` object containing `from` and `to` dates, or `undefined` if the preset is invalid.
 */
export function calculateDateRange(preset: string): DateRange | undefined {
  const today = new Date();

  switch (preset) {
    case 'Today':
      return { from: today, to: today };
    case 'Yesterday':
      return { from: subDays(today, 1), to: subDays(today, 1) };
    case 'This Week':
      return { from: startOfWeek(today), to: endOfWeek(today) };
    case 'Last Week':
      return {
        from: startOfWeek(subDays(today, 7)),
        to: endOfWeek(subDays(today, 7)),
      };
    case 'Past Two Weeks':
      return { from: subDays(today, 14), to: today };
    case 'This Month':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'Last Month':
      return {
        from: startOfMonth(subDays(today, 30)),
        to: endOfMonth(subDays(today, 30)),
      };
    case 'This Year':
      return { from: startOfYear(today), to: endOfYear(today) };
    case 'Last Year':
      return {
        from: startOfYear(subDays(today, 365)),
        to: endOfYear(subDays(today, 365)),
      };
    default:
      return undefined;
  }
}

/**
 * Formats a date's day as a string with a leading zero if it is a single digit.
 *
 * @param day - The date to format.
 * @returns A string representing the day with a leading zero.
 */
export const formatDayWithLeadingZero = (day: Date): string => {
  const dayNumber = day.getDate();
  return dayNumber.toString().padStart(2, '0');
};

/**
 * Formats a camelCase or PascalCase string into a human-readable format.
 * Adds spaces between words and capitalizes the first letter.
 *
 * @param field - The string to format.
 * @returns A human-readable formatted string.
 */
export const formatFieldName = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/^[a-z]/, (char) => char.toUpperCase());
};

/**
 * Filters an array of objects based on a search term.
 * Searches through all string properties by default.
 *
 * @param items - The array of objects to search.
 * @param term - The search term.
 * @param getSearchableValues - Optional function to extract searchable values from an item.
 * @returns Filtered array of items matching the search term.
 */
export function searchItems<T extends Record<string, unknown>>(
  items: T[],
  term: string,
  getSearchableValues?: (item: T) => string[]
): T[] {
  if (!term.trim()) return items;

  return items.filter((item) => {
    const searchableValues = getSearchableValues
      ? getSearchableValues(item)
      : (Object.values(item).filter(
          (value) => typeof value === 'string'
        ) as string[]);

    return searchableValues.some((value) =>
      value.toLowerCase().includes(term.toLowerCase())
    );
  });
}

/**
 * * Extracts and returns the initials from a given name.
 * If the name is empty or undefined, returns an empty string.
 *
 * @param name - The full name to extract initials from.
 * @returns The uppercase initials of the name.
 */
export const getInitials = (name?: string): string => {
  return name
    ? name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .toUpperCase()
    : '';
};

/**
 * Generates consistent avatar colors based on input text.
 * Uses a hash function to ensure the same text always produces the same colors.
 *
 * @param text - The text to generate colors for (e.g., name, email).
 * @returns An object containing background and text color classes.
 */
export const getAvatarColors = (
  text?: string
): { bgClass: string; textClass: string } => {
  if (!text) return { bgClass: 'bg-gray-500', textClass: 'text-white' };

  // Simple hash function for consistent color generation
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Color combinations with good contrast
  const colorCombinations = [
    { bgClass: 'bg-blue-500', textClass: 'text-white' },
    { bgClass: 'bg-green-500', textClass: 'text-white' },
    { bgClass: 'bg-purple-500', textClass: 'text-white' },
    { bgClass: 'bg-red-500', textClass: 'text-white' },
    { bgClass: 'bg-orange-500', textClass: 'text-white' },
    { bgClass: 'bg-teal-500', textClass: 'text-white' },
    { bgClass: 'bg-pink-500', textClass: 'text-white' },
    { bgClass: 'bg-indigo-500', textClass: 'text-white' },
  ];

  const index = Math.abs(hash) % colorCombinations.length;
  return colorCombinations[index];
};

/**
 * Returns a greeting message based on the current time of the day.
 *
 * - Morning: 5:00 AM to 11:59 AM -> "Good morning"
 * - Afternoon: 12:00 PM to 4:59 PM -> "Good afternoon"
 * - Evening: 5:00 PM to 8:59 PM -> "Good evening"
 * - Night: 9:00 PM to 4:59 AM -> "Good night"
 *
 * The function uses the user's local timezone to determine the current time.
 *
 * @returns {string} A greeting message corresponding to the current time of day.
 */
export const getGreeting = (): string => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning 💪🏼';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon ☀️';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening 🌙';
  } else {
    return 'Good night 💤';
  }
};

/**
 * Converts a Base64 string into a File object.
 * Useful for handling file uploads from Base64-encoded images.
 *
 * @param base64String - The Base64-encoded image data.
 * @param fileName - The desired name for the resulting File object.
 * @returns A File object representing the image.
 */
export function base64ToFile(base64String: string, fileName: string): File {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/png' });
  return new File([blob], fileName, { type: 'image/png' });
}

/**
 * Returns the corresponding color classes for a given difficulty level.
 * Used for styling elements based on difficulty.
 *
 * @param level - The difficulty level ('beginner', 'intermediate', 'advanced').
 * @returns A string containing Tailwind CSS classes for background and text color.
 */
export const getDifficultyColor = (level: string) => {
  switch (level) {
    case 'beginner':
      return 'bg-neutral-green-500/10 border-neutral-green-500';
    case 'intermediate':
      return 'bg-neutral-ochre-600/10 border-neutral-ochre-500';
    case 'advanced':
      return 'bg-alert-red-500/10 border-alert-red-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
};

/**
 * Returns a valid image source for a profile picture.
 * Handles Base64 strings, data URLs, File objects, and provides a fallback if null.
 * Checks both profilePicture and photoPath fields.
 *
 * @param profilePicture - The profile picture as a Base64 string, data URL, File, or null.
 * @param photoPath - Alternative field for photo path (URL or Base64).
 * @returns A valid image source URL or undefined.
 */
export const getProfilePictureSrc = (
  profilePicture?: string | File | null,
  photoPath?: string | null
) => {
  const source = profilePicture || photoPath;
  if (!source) return undefined;

  if (typeof source === 'string') {
    // If it's already a full URL or data URL, return as is
    if (source.startsWith('http') || source.startsWith('data:image')) {
      return source;
    }
    // Otherwise treat as Base64
    return `data:image/png;base64,${source}`;
  }

  return URL.createObjectURL(source);
};

/**
 * Safely creates a Date object from a string value.
 * Returns undefined if the date is invalid.
 *
 * @param dateValue - The date string to parse.
 * @returns A valid Date object or undefined.
 */
export const safeParseDate = (
  dateValue: string | null | undefined
): Date | undefined => {
  if (!dateValue) return undefined;
  try {
    const date = new Date(dateValue);
    return !isNaN(date.getTime()) ? date : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Safely formats a date string using Intl.DateTimeFormat.
 * Returns fallback text if the date is invalid.
 *
 * @param dateValue - The date string to format.
 * @param locale - The locale to use for formatting (default: 'en-GB').
 * @param fallback - The fallback text if date is invalid (default: 'N/A').
 * @returns A formatted date string or fallback text.
 */
export const safeFormatDate = (
  dateValue: string | null | undefined,
  locale: string = 'en-GB',
  fallback: string = 'N/A'
): string => {
  const date = safeParseDate(dateValue);
  return date ? new Intl.DateTimeFormat(locale).format(date) : fallback;
};

/**
 * Safely formats a date string using date-fns format.
 * Returns fallback text if the date is invalid.
 *
 * @param dateValue - The date string to format.
 * @param formatStr - The format string (default: 'MMM do, yyyy').
 * @param fallback - The fallback text if date is invalid (default: 'N/A').
 * @returns A formatted date string or fallback text.
 */
export const safeDateFormat = (
  dateValue: string | null | undefined,
  formatStr: string = 'MMM do, yyyy',
  fallback: string = 'N/A'
): string => {
  if (!dateValue) return fallback;
  try {
    return format(parseISO(dateValue), formatStr);
  } catch {
    return fallback;
  }
};

/**
 * Formats an ISO date string to a readable format.
 *
 * @param isoString - The ISO date string to format.
 * @param format - Format type: 'date', 'time', or 'both' (default).
 * @returns A formatted string.
 */
export const formatDateTime = (
  isoString: string,
  format: 'date' | 'time' | 'both' = 'both'
): string => {
  try {
    const date = new Date(isoString);

    if (format === 'date') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }

    if (format === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
};

/**
 * Calculates age from a date of birth string.
 *
 * @param dob - Date of birth in ISO string format.
 * @returns The calculated age in years.
 */
export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Calculates days remaining until a target date from today.
 * Normalizes both dates to midnight for accurate day calculation.
 *
 * @param targetDate - The target date string.
 * @returns Number of days remaining (negative if overdue).
 */
export const calculateDaysRemaining = (targetDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Maps payment status strings to standardized badge status.
 *
 * @param paymentStatus - The payment status from API.
 * @param pendingAmount - The pending amount (optional fallback).
 * @returns Standardized status for badges.
 */
export const getPaymentBadgeStatus = (
  paymentStatus: string,
  pendingAmount?: number
): 'paid' | 'partially_paid' | 'unpaid' => {
  switch (paymentStatus) {
    case 'paid':
      return 'paid';
    case 'unpaid':
      return 'unpaid';
    case 'partially_paid':
      return 'partially_paid';
    default:
      return (pendingAmount ?? 0) > 0 ? 'unpaid' : 'paid';
  }
};

/**
 * Gets urgency configuration based on days remaining.
 *
 * @param daysRemaining - Number of days remaining.
 * @returns Urgency configuration object.
 */
export const getUrgencyConfig = (daysRemaining: number) => {
  if (daysRemaining <= 0) {
    return {
      bgColor: 'bg-red-500/20 text-red-300',
      color: 'red' as const,
      text: 'EXPIRED',
    };
  } else if (daysRemaining <= 1) {
    return {
      bgColor: 'bg-red-500/20 text-red-300',
      color: 'red' as const,
      text: daysRemaining === 1 ? 'Tomorrow' : 'Today',
    };
  } else if (daysRemaining <= 3) {
    return {
      bgColor: 'bg-orange-500/20 text-orange-300',
      color: 'orange' as const,
      text: `${daysRemaining}d left`,
    };
  } else if (daysRemaining <= 7) {
    return {
      bgColor: 'bg-yellow-500/20 text-yellow-300',
      color: 'yellow' as const,
      text: `${daysRemaining}d left`,
    };
  } else {
    return {
      bgColor: 'bg-secondary-green-500/20 text-green-300',
      color: 'green' as const,
      text: `${daysRemaining}d left`,
    };
  }
};

/**
 * Formats currency amounts with K/L suffixes for large numbers.
 *
 * @param amount - The amount to format.
 * @returns Formatted currency string.
 */
export const formatAmount = (amount: number): string => {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(0)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
};

/**
 * Payment chart color constants.
 */
export const PAYMENT_CHART_COLORS = {
  UNPAID: '#F7FF93',
  PAID: '#96AF01',
} as const;
