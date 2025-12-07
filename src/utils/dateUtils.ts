import { format, parseISO } from "date-fns";

/**
 * Format date string (YYYY-MM-DD) to Vietnamese format
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch {
    return dateString;
  }
};

/**
 * Format datetime string (ISO) to Vietnamese format
 */
export const formatDateTime = (dateTimeString: string): string => {
  try {
    return format(parseISO(dateTimeString), "dd/MM/yyyy HH:mm");
  } catch {
    return dateTimeString;
  }
};

/**
 * Convert date input (YYYY-MM-DD) to ISO date string
 */
export const toISODate = (date: string): string => {
  return date; // Already in correct format
};

/**
 * Convert datetime-local input to ISO datetime string
 */
export const toISODateTime = (dateTime: string): string => {
  // Input from datetime-local is in format: YYYY-MM-DDTHH:mm
  // Backend expects: YYYY-MM-DDTHH:mm:ss
  if (dateTime && !dateTime.includes(":00", dateTime.length - 3)) {
    return `${dateTime}:00`;
  }
  return dateTime;
};

/**
 * Convert ISO datetime to datetime-local input format
 */
export const fromISODateTime = (isoDateTime: string): string => {
  try {
    // Remove seconds if present for datetime-local input
    return isoDateTime.substring(0, 16);
  } catch {
    return isoDateTime;
  }
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = (): string => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * Get current datetime in YYYY-MM-DDTHH:mm format
 */
export const getCurrentDateTime = (): string => {
  return format(new Date(), "yyyy-MM-dd'T'HH:mm");
};
