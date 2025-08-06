/**
 * CSV export functionality for discount data
 */

import type { DiscountRecord } from '../types/discount';
import { getMonthName, calculateDaysBetween } from './dateUtils';

/**
 * Convert discount records to CSV format
 */
export function convertToCSV(records: DiscountRecord[]): string {
  if (records.length === 0) {
    return '';
  }

  // Define headers
  const headers = [
    'Client Id',
    'Client',
    'Platform',
    'Region',
    'Discount',
    'Start Date',
    'Start Time',
    'End Date',
    'End Time',
    'Percent',
    'Deadline',
    'Implementation Status',
    'Sales Event Status',
    'Comments',
    'Month',
    'Length (Days)'
  ];

  // Convert records to CSV rows
  const rows = records.map(record => {
    const month = getMonthName(record.startDate);
    const length = calculateDaysBetween(record.startDate, record.endDate);
    
    return [
      escapeCSVValue(record.clientId),
      escapeCSVValue(record.client),
      escapeCSVValue(record.platform),
      escapeCSVValue(record.region),
      escapeCSVValue(record.discount),
      escapeCSVValue(record.startDate),
      escapeCSVValue(record.startTime),
      escapeCSVValue(record.endDate),
      escapeCSVValue(record.endTime),
      record.percent.toString(),
      escapeCSVValue(record.deadline),
      escapeCSVValue(record.implementationStatus),
      escapeCSVValue(record.salesEventStatus),
      escapeCSVValue(record.comments),
      escapeCSVValue(month),
      length.toString()
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Escape CSV values that contain commas, quotes, or newlines
 */
function escapeCSVValue(value: string | number): string {
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Download CSV file
 */
export function downloadCSV(records: DiscountRecord[], filename: string = 'discount-data.csv'): void {
  const csvContent = convertToCSV(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string = 'discount-data'): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[:]/g, '-');
  return `${prefix}-${timestamp}.csv`;
}