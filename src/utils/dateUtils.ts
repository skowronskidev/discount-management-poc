/**
 * Date utility functions for the Discount Management System
 */

/**
 * Get the month name from a date string (yyyy-mm-dd)
 */
export function getMonthName(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', { month: 'long' });
  } catch {
    return '';
  }
}

/**
 * Calculate the number of days between two dates
 */
export function calculateDaysBetween(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const timeDifference = end.getTime() - start.getTime();
    const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
    
    return Math.max(0, daysDifference);
  } catch {
    return 0;
  }
}

/**
 * Format date to yyyy-mm-dd format
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date in yyyy-mm-dd format
 */
export function getTodayString(): string {
  return formatDate(new Date());
}

/**
 * Add days to a date string and return new date string
 */
export function addDays(dateString: string, days: number): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    date.setDate(date.getDate() + days);
    return formatDate(date);
  } catch {
    return dateString;
  }
}

/**
 * Validate if a string is a valid date in yyyy-mm-dd format
 */
export function isValidDateString(dateString: string): boolean {
  if (!dateString) return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}