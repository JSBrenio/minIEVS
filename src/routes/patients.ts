import express, { NextFunction, Request, Response, Router } from 'express';
import { IPatient, IPatientPostRequest } from '../models';
import { getPatientById, addPatient, getAllPatients } from '../util/database';
import { validatePatientIdParam, validatePatientData } from '../middleware';

const patientsRouter: Router = express.Router();

// GET /patients/all - Get all patients
patientsRouter.get('/all', async (request: Request, response: Response) => {
    try {
        
        const patients = await getAllPatients();
        
        response.status(200).json({
            count: patients.length,
            data: patients
        });

    } catch (error) {
        console.error('Error getting all patients: ', error);
        response.status(500).json({
            message: 'Internal server error',
        });
    }
});

// GET /patients/:patientId - Get specific patient by ID
patientsRouter.get('/:patientId', validatePatientIdParam, async (request: Request, response: Response) => {
    try {
        const { patientId } = request.params;
        const patient = await getPatientById(patientId);
        
        if (!patient) {
            response.status(404).json({
                error: 'Patient Not Found',
                message: `Patient with ID ${patientId} not found`
            });
            return;
        }

        response.status(200).json(patient);

    } catch (error) {
        console.error('Error retrieving patient by ID:', error);
        response.status(500).json({
            message: 'Internal server error',
        });
    }
});

// POST /patients - Create patient
patientsRouter.post('/', validatePatientData, async (request: IPatientPostRequest, response: Response) => {
    try {
        const patientData: IPatient = request.body;
        await addPatient(patientData);
        
        response.status(201).json({
            message: 'Patient created successfully',
            patient: patientData
        });

    } catch (error) {
        console.error('Error creating patient:', error);
        
        // Handle duplicate patient error
        if (error.message?.includes('already exists')) {
            response.status(409).json({
                error: 'Conflict',
                message: error.message
            });
            return;
        }
        
        response.status(500).json({
            message: 'Internal server error',
        });
    }
});

export { patientsRouter }