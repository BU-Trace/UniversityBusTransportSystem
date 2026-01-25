import express from 'express';
import * as NotificationController from './notification.controller';

const router = express.Router();

router.post('/', NotificationController.addNotification);
router.put('/:id', NotificationController.updateNotification);
router.delete('/:id', NotificationController.deleteNotification);
router.get('/', NotificationController.getAllNotifications);
router.get('/:id', NotificationController.getNotification);

export default router;
