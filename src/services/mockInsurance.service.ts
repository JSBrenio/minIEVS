import { IEligibilityCheckRequest, IEligibilityResult } from '../models';

const errorCodes = require('./errors.json');

/**
 * List of health insurances that is mocked:
 * UnitedHealthCare
 * Elevance Health
 * Kaiser Permanente
 * Cigna
 * Molina Healthcare
 * BlueCross BlueShield
 */

/**
 * Mock Insurance Service API that has a chance to make patients eligible or not.
 */
export class MockInsuranceService {
  
  private readonly insuranceCompanies = [
    'UnitedHealthCare',
    'Elevance Health', 
    'Kaiser Permanente',
    'Cigna',
    'Molina Healthcare',
    'BlueCross BlueShield'
  ];

  async simulateEligibilty(request: IEligibilityCheckRequest): Promise<IEligibilityResult> {
    
    const { 
      patientId, 
      insuranceMemberId,
      insuranceCompany,
    } = request.body;
    
    // Generate unique eligibility ID and Current Date
    const eligibilityId = `ELG-${Date.now()}`;
    const checkDateTime = new Date().toISOString();
    
    // Early check for valid health insurances covered from list
    if (!this.insuranceCompanies.includes(insuranceCompany)) {
      return {
        eligibilityId: eligibilityId,
        patientId: patientId,
        checkDateTime: checkDateTime,
        insuranceMemberId: insuranceMemberId,
        insuranceCompany: insuranceCompany,
        status: "Unknown",
        coverage: undefined,
        errors: [errorCodes.UNKNOWN_INSURANCE[0]]
      }
    }

    // Stages: 75% success rate, 25% failure rate
    const primaryChance = Math.random() * 100;

    // Success case: return active insurance coverage
    if (primaryChance < 75) {
      
      return {
        eligibilityId: eligibilityId,
        patientId: patientId,
        checkDateTime: checkDateTime,
        insuranceMemberId: insuranceMemberId,
        insuranceCompany: insuranceCompany,
        status: "Active",
        coverage: this.generateRandomCoverage(),
        errors: []
      };
    }
    
    // Failure case: In the 25% failure group, distribute among failure types
    const failureChance = Math.random() * 100;
    
    // 10% of failures = API failures
    if (failureChance < 10) {
      return {
        eligibilityId: eligibilityId,
        patientId: patientId,
        checkDateTime: checkDateTime,
        insuranceMemberId: insuranceMemberId,
        insuranceCompany: insuranceCompany,
        status: "Unknown",
        coverage: undefined,
        errors: [this.getRandomError('API_FAILURES')]
      };
    }
    
    // 20% of failures = verification issues (10-30%)
    if (failureChance < 30) {
      return {
        eligibilityId: eligibilityId,
        patientId: patientId,
        checkDateTime: checkDateTime,
        insuranceMemberId: insuranceMemberId,
        insuranceCompany: insuranceCompany,
        status: "Unknown",
        coverage: undefined,
        errors: [this.getRandomError('VERIFICATION_ISSUES')]
      };
    }
    
    // 70% of failures = expired/inactive insurance (30-100%)
    return {
      eligibilityId: eligibilityId,
      patientId: patientId,
      checkDateTime: checkDateTime,
      insuranceMemberId: insuranceMemberId,
      insuranceCompany: insuranceCompany,
      status: "Inactive",
      coverage: undefined,
      errors: [this.getRandomError('NOT_ELIGIBLE')]
    };
  }

  /**
   * Randomly selects an error from the specified category
   */
  private getRandomError(category: 'API_FAILURES' | 'NOT_ELIGIBLE' | 'VERIFICATION_ISSUES') {
    const errorList = errorCodes[category];
    return errorList[Math.floor(Math.random() * errorList.length)];
  }

  /**
   * Generates random coverage values
   */
  private generateRandomCoverage() {
    const deductible = Math.round((Math.random() * 2500 + 500) * 100) / 100; // $500 - $3000
    const deductibleMet = Math.round((Math.random() * deductible) * 100) / 100; // 0% - 100% of deductible
    const copay = Math.round((Math.random() * 40 + 10) * 100) / 100; // $10 - $50
    const outOfPocketMax = Math.round((Math.random() * 5000 + 3000) * 100) / 100; // $3000 - $8000
    const outOfPocketMet = Math.round((Math.random() * outOfPocketMax) * 100) / 100; // 0% - 100% of max

    return {
      deductible,
      deductibleMet,
      copay,
      outOfPocketMax,
      outOfPocketMet
    };
  }
}