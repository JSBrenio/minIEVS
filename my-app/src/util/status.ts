/**
 * Status utilities for the Insurance Eligibility Verification System
 * Handles status-related formatting and color mapping
 */

/**
 * Maps eligibility status strings to Material-UI color variants
 * Used for consistent status chip coloring across the application
 * @param status - The eligibility status (e.g., "Active", "Inactive")
 * @returns Material-UI color variant for chips and indicators
 */
export const getEligibilityStatusColor = (status: string): 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'error';
    default:
      return 'warning';
  }
};
