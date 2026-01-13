import express from 'express';
import * as NotificationController from './notification.controller';

const router = express.Router();

router.post('/broadcast', NotificationController.broadcastToAll);
router.get('/', NotificationController.getRecent);

export default router;
