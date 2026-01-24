import express from 'express';
import * as BusController from './bus.controller';

const router = express.Router();

router.post('/add-bus', BusController.addBus);
router.put('/update-bus/:id', BusController.updateBus);
router.delete('/delete-bus/:id', BusController.deleteBus);
router.get('/get-all-buses', BusController.getAllBuses);

export default router;
