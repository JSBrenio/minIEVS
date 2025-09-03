/**
 * Currency formatting utilities for the Insurance Eligibility Verification System
 * Ensures all financial calculations are properly rounded to two decimal places
 */

/**
 * Formats a number as currency with proper rounding to two decimal places
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "25.00", "1,234.56")
 */
export const formatCurrency = (amount: number): string => {
  // Round to 2 decimal places using proper rounding
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2);
};

/**
 * Calculates the difference between two amounts with proper rounding
 * @param total - The total amount
 * @param used - The amount already used/met
 * @returns The remaining amount, properly rounded to two decimal places
 */
export const calculateRemaining = (total: number, used: number): number => {
  const remaining = total - used;
  return Math.round((remaining + Number.EPSILON) * 100) / 100;
};
