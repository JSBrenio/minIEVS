import { pool } from './sql_conn';
import { IPatient, IEligibilityResult, IEligibilityCheck} from '../models';

/**
 * Add patient data to database 
 * @param patient 
 */
export async function addPatient(patient: IPatient): Promise<void> {
  const {
    patientId,
    patientName,
    dateOfBirth
  } = patient;

  /**
   * Case 1: No existing patient_id -> regular insert
   * Case 2: Existing patient_id with identical name and dob -> do nothing
   * Case 3: Existing patient_id with mismatch name or dob -> throw error
   */
  const query =
  `
    INSERT INTO patients (patient_id, name, date_of_birth)
    VALUES ($1, $2, $3)
    ON CONFLICT (patient_id) DO NOTHING
    RETURNING *;
  `
  ;
  const values = [patientId, patientName, dateOfBirth]
  
  try {

    // Case 1
    const potentialPatient: any  = await pool.query(query, values);
   
    // Case 2
    if (potentialPatient.rows.length === 0) {
      const existingPatient = await pool.query(
        `SELECT * FROM patients WHERE patient_id = $1`,
        [patientId]
      );

      // Case 3
      if (existingPatient.rows[0].name !== patientName) throw new Error("Name Doesn't Match");
      if (existingPatient.rows[0].date_of_birth.toISOString().slice(0, 10) !== dateOfBirth) throw new Error("Date of Birth Doesn't Match")
    }
  } catch (error) {
    console.error("Query on addPatient Failed", error);
    throw error;
  }
}

/**
 * save eligibility result to Database 
 * @param result
 */
export async function saveEligibilityCheck(result: IEligibilityResult): Promise<void> {
  const query = 
  `
    INSERT INTO eligibility (
      eligibility_id, 
      patient_id, 
      check_date_time, 
      insurance_member_id, 
      insurance_company, 
      service_date, 
      status, 
      deductible, 
      deductible_met, 
      copay, 
      out_of_pocket_max, 
      out_of_pocket_met, 
      errors
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `;
  try {
    await pool.query(query, [
      result.eligibilityId,
      result.patientId,
      result.checkDateTime,
      result.insuranceMemberId || null,
      result.insuranceCompany || null,
      result.checkDateTime.split('T')[0], // Extract date from timestamp for service_date
      result.status,
      result.coverage?.deductible || null,
      result.coverage?.deductibleMet || null,
      result.coverage?.copay || null,
      result.coverage?.outOfPocketMax || null,
      result.coverage?.outOfPocketMet || null,
      JSON.stringify(result.errors || [])
    ]);
  } catch (error) {
    console.error("Failed to insert to database", error);
    throw error;
  }
}

/**
 * Get a patient's past eligibility checks by patientId
 * @param patientId 
 * @returns 
 */
export async function getPatientHistory(patientId: string): Promise<IEligibilityResult[]> {
  const query = `
    SELECT *
    FROM eligibility 
    WHERE patient_id = $1 
    ORDER BY check_date_time DESC
  `;
  
  const result = await pool.query(query, [patientId]);
  
  return result.rows.map(row => ({
    eligibilityId: row.eligibility_id,
    patientId: row.patient_id,
    checkDateTime: row.check_date_time,
    insuranceMemberId: row.insurance_member_id,
    insuranceCompany: row.insurance_company,
    status: row.status,
    coverage: row.deductible !== null ? {
      deductible: parseFloat(row.deductible),
      deductibleMet: parseFloat(row.deductible_met || 0),
      copay: parseFloat(row.copay || 0),
      outOfPocketMax: parseFloat(row.out_of_pocket_max || 0),
      outOfPocketMet: parseFloat(row.out_of_pocket_met || 0)
    } : undefined,
    errors: row.errors
  }));
}

/**
 * Get ALL patients' information
 * @returns IPatient[]
 */
export async function getAllPatients(): Promise<IPatient[]> {
  const query = `SELECT * FROM patients`;
  const result = await pool.query(query);
  return result.rows.map(row => ({
    patientId: row.patient_id,
    patientName: row.name,
    dateOfBirth: row.date_of_birth
  }))
}


/**
 * Get ALL eligibility checks from all patients 
 * @returns IEligiblityResult[]
 */
export async function getAllEligibilityChecks(): Promise<IEligibilityResult[]> {
  const query = `
    SELECT *
    FROM eligibility 
    ORDER BY check_date_time DESC
  `;
  
  const result = await pool.query(query);
  
  return result.rows.map(row => ({
    eligibilityId: row.eligibility_id,
    patientId: row.patient_id,
    checkDateTime: row.check_date_time,
    insuranceMemberId: row.insurance_member_id,
    insuranceCompany: row.insurance_company,
    status: row.status,
    coverage: row.deductible !== null ? {
      deductible: parseFloat(row.deductible),
      deductibleMet: parseFloat(row.deductible_met || 0),
      copay: parseFloat(row.copay || 0),
      outOfPocketMax: parseFloat(row.out_of_pocket_max || 0),
      outOfPocketMet: parseFloat(row.out_of_pocket_met || 0)
    } : undefined,
    errors: row.errors
  }));
}

/**
 * Get a patient's information by patientId 
 * @param patientId 
 * @returns IPatient or null
 */
export async function getPatientById(patientId: string): Promise<IPatient | null> {
  const query = `
    SELECT * 
    FROM patients 
    WHERE patient_id = $1
  `;
  
  const result = await pool.query(query, [patientId]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    patientId: row.patient_id,
    patientName: row.name,
    dateOfBirth: row.date_of_birth
  };
}