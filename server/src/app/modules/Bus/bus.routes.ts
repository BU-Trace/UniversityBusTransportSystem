import express from 'express';
import * as BusController from './bus.controller';

import validateRequest from '../../middleware/validateRequest';
import { busCreateSchema, busUpdateSchema } from './bus.validation';

const router = express.Router();

router.post('/add-bus', validateRequest(busCreateSchema), BusController.addBus);
router.put('/update-bus/:id', validateRequest(busUpdateSchema), BusController.updateBus);
router.delete('/delete-bus/:id', BusController.deleteBus);
router.get('/get-all-buses', BusController.getAllBuses);
router.get('/get-bus/:id', BusController.getSingleBus);
// Additional bus routes can be added here
export default router;
