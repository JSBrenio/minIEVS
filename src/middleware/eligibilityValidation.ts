import { Request, Response, NextFunction } from 'express';
import { IEligibilityCheckRequest, IEligibilityCheck } from '../models';

/**
 * Middleware to validate eligibility check request data
 * Ensures all required fields are present and properly formatted
 */
export const validateEligibilityCheckRequest = (
  req: IEligibilityCheckRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const requestBody: IEligibilityCheck = req.body;
    const { 
      patientId, 
      patientName, 
      dateOfBirth,
      insuranceMemberId,
      insuranceCompanyName,
      serviceDate 
    } = requestBody;

    // Validate required patient information
    if (!patientId || typeof patientId !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Patient ID is required and must be a string'
      });
    }

    if (!patientName || typeof patientName !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Patient name is required and must be a string',
        name: patientName
      });
    }

    if (!dateOfBirth || typeof dateOfBirth !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Date of birth is required and must be a string'
      });
    }

    if (!serviceDate || typeof serviceDate !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Service date is required and must be a string'
      });
    }

    // Validate date formats
    if (isNaN(Date.parse(dateOfBirth))) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid date of birth format. Expected ISO date string (YYYY-MM-DD)'
      });
    }

    if (isNaN(Date.parse(serviceDate))) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid service date format. Expected ISO date string or timestamp'
      });
    }

    // Validate optional insurance fields if provided
    if (insuranceMemberId && typeof insuranceMemberId !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Insurance member ID must be a string if provided'
      });
    }

    if (insuranceCompanyName && typeof insuranceCompanyName !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Insurance company name must be a string if provided'
      });
    }

    // If all validations pass, continue to next middleware
    next();

  } catch (error) {
    console.error('Eligibility validation middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during request validation'
    });
  }
};
