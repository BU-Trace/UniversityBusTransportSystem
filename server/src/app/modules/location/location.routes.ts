import express from 'express';
import * as LocationController from './location.controller';

const router = express.Router();

router.post('/', LocationController.addLocation);
router.put('/:id', LocationController.updateLocation);
router.delete('/:id', LocationController.deleteLocation);
router.get('/', LocationController.getAllLocations);
router.get('/:id', LocationController.getLocation);
router.get('/bus/:busId/latest', LocationController.getLatestLocationByBus);

export default router;
