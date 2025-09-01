import { IEligibilityCheckRequest, IEligibilityResult, IPatient } from '../models';
import { MockInsuranceService } from './mockInsurance.service';
import { addPatient, saveEligibilityCheck, getPatientHistory, getAllEligibilityChecks } from '../util/database';

export class EligibilityService {
  private mockInsurance: MockInsuranceService;
  
  constructor() {
    this.mockInsurance = new MockInsuranceService();
  }
  
  /**
   * Checks a patient's eligibility given patient data and insurance information
   *  
   * @param request: IEligibilityCheckRequest
   * @returns IEligibilityResult
   */
  async checkEligibility(request: IEligibilityCheckRequest): Promise<IEligibilityResult> {
    const { patientId, patientName, dateOfBirth } = request.body;
    // Add patient info using utility function (will throw error if patientId already exists with mismatched data)
    try {
      await addPatient({
        patientId: patientId,
        patientName: patientName,
        dateOfBirth: dateOfBirth
      } as IPatient);
    } catch (error) {
      throw error;
    }
    
    // Call mock insurance API
    const result = await this.mockInsurance.simulateEligibilty(request);
    
    // Store eligibility check result using utility function
    await saveEligibilityCheck(result);
    
    // 4. Return response
    return result;
  }
  
  /**
   * Get a patient's eligiblity history from a patient's patientid
   * 
   * @param patientId 
   * @returns IEligibilityResult[]
   */
  async getPatientEligibilityHistory(patientId: string): Promise<IEligibilityResult[]> {
    return await getPatientHistory(patientId);
  }

  /**
   * Get all eligibility checks
   * 
   * @returns IElgibilityResult[]
   */
  async getAllEligibilityChecks(): Promise<IEligibilityResult[]> {
    return await getAllEligibilityChecks(); 
  }
}