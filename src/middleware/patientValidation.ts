import { Request, Response, NextFunction } from 'express';
import { IEligibilityCheckRequest, IEligibilityCheck } from '../models';

/**
 * Middleware to validate patient ID parameter in routes
 */
export const validatePatientIdParam = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  const patientId = req.params.patientID || req.params.patientId;
  
  if (!patientId || typeof patientId !== 'string') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Patient ID parameter is required and must be a string'
    });
  }

  if (patientId.trim().length === 0) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Patient ID parameter cannot be empty'
    });
  }

  next();
};

/**
 * Middleware to validate patient data for POST/PUT requests
 */
export const validatePatientData = (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const { patientId, name, dateOfBirth } = req.body;

    if (!patientId || typeof patientId !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Patient ID is required and must be a string'
      });
    }

    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Patient name is required and must be a string'
      });
    }

    if (!dateOfBirth || typeof dateOfBirth !== 'string') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Date of birth is required and must be a string'
      });
    }

    if (isNaN(Date.parse(dateOfBirth))) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid date of birth format. Expected ISO date string (YYYY-MM-DD)'
      });
    }

    next();

  } catch (error) {
    console.error('Patient validation middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred during patient data validation'
    });
  }
};