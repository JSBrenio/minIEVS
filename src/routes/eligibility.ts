import express, { Request, Response, Router } from 'express';
import { IEligibilityCheckRequest } from '../models';
import { validateEligibilityCheckRequest, validatePatientIdParam } from '../middleware';
import { EligibilityService } from '../services/eligibility.service';

const eligibilityRouter: Router = express.Router();
const eligibilityService = new EligibilityService();

// GET /eligibility/all - Simple test route to get all eligibility records
eligibilityRouter.get('/all', async (request: Request, response: Response) => {
    try {
        const data = await eligibilityService.getAllEligibilityChecks();
        
        response.status(200).json({
            count: data.length,
            data: data
        });

    } catch (error) {
        console.error('Error executing query:', error);
        response.status(500).json({
            message: 'Internal server error',
        });
    }
});


// res.params for /:param
// res.query for /routeName?param=value

/**
 * eligbility/history/{patientID}
 */
eligibilityRouter.get('/history/:patientID', validatePatientIdParam, async (request: Request, response: Response) => {
    try {
        const { patientID } = request.params;
        const history = await eligibilityService.getPatientEligibilityHistory(patientID);
        response.status(200).json(history);
    } catch (error) {
        console.error('Failed to get patient history:', error);
        response.status(500).json({
            message: 'Internal server error'
        })
    }
});

/**
 * eligibility/check
 */
eligibilityRouter.post('/check', validateEligibilityCheckRequest, async (request: IEligibilityCheckRequest, response: Response) => {
    try {
        const result = await eligibilityService.checkEligibility(request);
        response.status(201).json(result);
    } catch (error) {
        console.error('Eligibility check failed:', error);
        
        // Handle when patientId already exists 
        if (error.message?.includes('Doesn\'t Match')) {
            response.status(409).json({
                message: `Patient ID data mismatch: ${error.message}`
            });
            return;
        }
        
        // Default to internal server error
        response.status(500).json({
            message: 'Internal server error'
        });
    }
});

export { eligibilityRouter };