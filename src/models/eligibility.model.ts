// Eligibility model interfaces for the Insurance Eligibility Verification System
import { Request } from "express";
import { IPatient } from "./patient.model";

/**
 * Represents an error that occurred during eligibility verification
 * Used when insurance company returns validation errors or system issues
 * 
 * @interface IEligibilityError
 * @property {string} code - Short error code identifier
 * @property {string} message - Expanded error description explaining what went wrong
 * @example
 * {
 *   "code": "INSURANCE_EXPIRED",
 *   "message": "Insurance policy expired on 2023-12-31"
 * }
 */
interface IEligibilityError {
    /** Short error code */
    code: string;
    /** Expanded error description explaining what went wrong */
    message: string;
}

/**
 * Insurance coverage details including deductibles, copays, and out-of-pocket maximums
 * Contains financial information about the patient's insurance benefits and current usage
 * 
 * @interface ICoverage
 * @property {number} deductible - Total annual deductible amount that must be met before insurance coverage begins
 * @property {number} deductibleMet - Amount of deductible already met/paid by patient this year
 * @property {number} copay - Fixed copay amount patient pays per visit/service
 * @property {number} outOfPocketMax - Maximum out-of-pocket expense patient will pay for the year
 * @property {number} outOfPocketMet - Amount already paid out-of-pocket by patient this year
 * @example
 * {
 *   "deductible": 1500.00,
 *   "deductibleMet": 750.00,
 *   "copay": 25.00,
 *   "outOfPocketMax": 5000.00,
 *   "outOfPocketMet": 1200.00
 * }
 */
interface ICoverage {
    /** Total annual deductible amount that must be met before insurance coverage begins */
    deductible: number;
    /** Amount of deductible already met/paid by patient this year */
    deductibleMet: number;
    /** Fixed copay amount patient pays per visit/service */
    copay: number;
    /** Maximum out-of-pocket expense patient will pay for the year */
    outOfPocketMax: number;
    /** Amount already paid out-of-pocket by patient this year */
    outOfPocketMet: number;
}

/**
 * Complete eligibility verification result returned from insurance company lookup
 * This is the main response interface containing all eligibility information for a patient
 * 
 * @interface IEligibilityResult
 * @property {string} eligibilityId - Unique identifier for this specific eligibility check record
 * @property {string} patientId - Patient identifier this eligibility check belongs to
 * @property {string} checkDateTime - When the eligibility verification was performed (ISO 8601 timestamp)
 * @property {string} [insuranceMemberId] - Insurance member ID used for verification (may differ from patientId)
 * @property {string} [insuranceCompany] - Name of the insurance company/provider that was checked
 * @property {'Active' | 'Inactive' | 'Unknown'} status - Current eligibility status determined from insurance verification
 * @property {ICoverage} [coverage] - Detailed coverage information (only available when status is Active)
 * @property {IEligibilityError[]} [errors] - Array of errors encountered during verification process
 * @example
 * {
 *   "eligibilityId": "ELG-2024-001",
 *   "patientId": "P123456",
 *   "checkDateTime": "2024-02-01T10:30:00Z",
 *   "insuranceMemberId": "MBR001",
 *   "insuranceCompanyName": "HealthPlan USA",
 *   "status": "Active",
 *   "coverage": {
 *     "deductible": 1500.00,
 *     "deductibleMet": 750.00,
 *     "copay": 25.00,
 *     "outOfPocketMax": 5000.00,
 *     "outOfPocketMet": 1200.00
 *   },
 *   "errors": []
 * }
 */
interface IEligibilityResult {
    /** Unique identifier for this specific eligibility check record */
    eligibilityId: string;
    /** Patient identifier this eligibility check belongs to */
    patientId: string;
    /** When the eligibility verification was performed (ISO 8601 timestamp) */
    checkDateTime: string; // ISO timestamp
    /** Insurance member ID used for verification (may differ from patientId) */
    insuranceMemberId?: string;
    /** Name of the insurance company/provider that was checked */
    insuranceCompany?:string;
    /** Current eligibility status determined from insurance verification */
    status: 'Active' | 'Inactive' | 'Unknown';
    /** Detailed coverage information (only available when status is Active) */
    coverage?: ICoverage;
    /** Array of errors encountered during verification process */
    errors?: IEligibilityError[];
}

/**
 * Request payload for performing a new eligibility verification check
 * Combines patient demographic information with insurance details needed for verification
 * 
 * @interface IEligibilityCheck
 * @extends IPatient
 * @property {string} patientId - Unique patient identifier (inherited from IPatient)
 * @property {string} patientName - Patient's full name (inherited from IPatient)
 * @property {string} dateOfBirth - Patient's date of birth in ISO format (inherited from IPatient)
 * @property {string} [insuranceMemberId] - Insurance member ID for verification lookup (may be different from patientId)
 * @property {string} [insuranceCompany] - Insurance company name to verify coverage with
 * @property {string} serviceData - Date/time of the service requiring eligibility verification (ISO timestamp)
 * @example
 * {
 *   "patientId": "P123456",
 *   "name": "John Doe",
 *   "dateOfBirth": "1985-03-15",
 *   "insuranceMemberId": "MBR001",
 *   "insuranceCompanyName": "HealthPlan USA",
 *   "serviceData": "2024-02-01T10:30:00Z"
 * }
 */
interface IEligibilityCheck extends IPatient {
    /** Insurance member ID for verification lookup (may be different from patientId) */
    insuranceMemberId?: string;
    /** Insurance company name to verify coverage with */
    insuranceCompany?: string;
    /** Date/time of the service requiring eligibility verification (ISO timestamp) */
    serviceDate: string; // ISO timeSTAMP
}

/**
 * Express.js request interface with typed body for eligibility check endpoints
 * Ensures type safety for POST /eligibility endpoints by defining the expected request body structure
 * 
 * @interface IEligibilityCheckRequest
 * @extends Request
 * @property {IEligibilityCheck} body - Request body containing eligibility check data with proper typing
 * @example
 * // In route handler:
 * app.post('/eligibility/check', (req: IEligibilityCheckRequest, res: Response) => {
 *   const { patientId, insuranceMemberId } = req.body; // TypeScript knows the structure
 * });
 */
interface IEligibilityCheckRequest extends Request {
    /** Request body containing eligibility check data with proper typing */
    body: IEligibilityCheck
}

/**
 * Query parameters interface for filtering eligibility records
 * Used in GET endpoints to search and filter eligibility results based on various criteria
 * 
 * @interface IEligibilityQuery
 * @property {string} [patientId] - Filter by specific patient ID to get all eligibility checks for one patient
 * @property {'Active' | 'Inactive' | 'Unknown'} [status] - Filter by eligibility status (Active, Inactive, or Unknown)
 * @property {string} [startDate] - Filter by eligibility checks performed on or after this date (ISO date string)
 * @property {string} [endDate] - Filter by eligibility checks performed on or before this date (ISO date string)
 * @example
 * // Query examples:
 * // GET /eligibility?patientId=P123456
 * // GET /eligibility?status=Active&startDate=2024-01-01&endDate=2024-12-31
 * {
 *   "patientId": "P123456",
 *   "status": "Active",
 *   "startDate": "2024-01-01",
 *   "endDate": "2024-12-31"
 * }
 */
interface IEligibilityQuery {
    /** Filter by specific patient ID to get all eligibility checks for one patient */
    patientId?: string;
    /** Filter by eligibility status (Active, Inactive, or Unknown) */
    status?: 'Active' | 'Inactive' | 'Unknown';
    /** Filter by eligibility checks performed on or after this date (ISO date string) */
    startDate?: string;
    /** Filter by eligibility checks performed on or before this date (ISO date string) */
    endDate?: string;
}

export { 
    IEligibilityError,
    ICoverage,
    IEligibilityResult,
    IEligibilityCheck,
    IEligibilityCheckRequest,
    IEligibilityQuery
};