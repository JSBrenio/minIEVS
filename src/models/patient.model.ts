// Patient model interfaces for the Insurance Eligibility Verification System

/**
 * Core patient demographic information interface
 * Contains the essential patient data required for insurance eligibility verification
 * This interface represents the minimum required patient information for all operations
 * 
 * @interface IPatient
 * @example
 * {
 *   "patientId": "P123456",
 *   "name": "John Doe",
 *   "dateOfBirth": "1985-03-15"
 * }
 */
interface IPatient {
    /** Unique patient identifier used throughout the system (e.g., P123456) */
    patientId: string;
    /** Patient's full name as it appears in medical records */
    name: string;
    /** Patient's date of birth in ISO format (YYYY-MM-DD) - required for insurance verification */
    dateOfBirth: string; // ISO date string (YYYY-MM-DD)
}

export { 
    IPatient,
};