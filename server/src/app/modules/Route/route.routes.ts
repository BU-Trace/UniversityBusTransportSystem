import express from 'express';
import * as RouteController from './route.controller';

const router = express.Router();

router.post('/', RouteController.addRoute);
router.put('/:id', RouteController.updateRoute);
router.delete('/:id', RouteController.deleteRoute);
router.get('/', RouteController.getAllRoutes);

export default router;
