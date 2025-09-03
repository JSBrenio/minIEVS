/**
 * Date formatting utilities for the Insurance Eligibility Verification System
 * Handles various date formatting needs across the application
 */

/**
 * Formats a date string to MM/DD/YYYY format without timezone issues
 * Used for displaying dates of birth and other date-only fields
 * @param dateString - ISO date string (e.g., "1985-03-15" or "1985-03-15T00:00:00Z")
 * @returns Formatted date string (e.g., "03/15/1985") or empty string if invalid
 */
export const formatDateOnly = (dateString: string): string => {
  if (!dateString) return '';
  
  // Remove timestamp if present and parse the date components
  // Input: "1985-03-15" or "1985-03-15T00:00:00Z" -> Output: "03/15/1985"
  const withoutTimeStamp = dateString.split('T')[0];
  const [year, month, day] = withoutTimeStamp.split('-');
  return `${month}/${day}/${year}`;
};

/**
 * Formats a date string with date and time for display in tables/lists
 * Used for displaying eligibility check timestamps and other datetime fields
 * @param dateString - ISO datetime string (e.g., "2025-09-02T10:30:00Z")
 * @returns Formatted datetime string (e.g., "Sep 2, 2025, 10:30 AM")
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
