import express from 'express';
import * as BusController from './bus.controller';

const router = express.Router();

router.post('/add-bus', BusController.addBus);
router.put('/update-bus/:id', BusController.updateBus);
router.delete('/delete-bus/:id', BusController.deleteBus);
router.get('/get-all-buses', BusController.getAllBuses);
router.get('/get-bus/:id', BusController.getSingleBus);
// Additional bus routes can be added here
export default router;
