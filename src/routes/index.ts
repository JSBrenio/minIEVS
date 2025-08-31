import express, { Router } from 'express';
import { eligibilityRouter } from './eligibility';
import { patientsRouter } from './patients';

const routes: Router = express.Router();

routes.use('/eligibility', eligibilityRouter);
routes.use('/patients', patientsRouter);

export { routes };