import express from 'express';
import * as RouteController from './route.controller';

import validateRequest from '../../middleware/validateRequest';
import { routeCreateSchema, routeUpdateSchema } from './route.validation';

const router = express.Router();

router.post('/add-route', validateRequest(routeCreateSchema), RouteController.addRoute);
router.put('/:id', validateRequest(routeUpdateSchema), RouteController.updateRoute);
router.delete('/:id', RouteController.deleteRoute);
router.get('/', RouteController.getAllRoutes);
//  --- IGNORE ---
export default router;
