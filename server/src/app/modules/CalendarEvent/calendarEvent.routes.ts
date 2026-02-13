import express from 'express';
import { CalendarEventController } from './calendarEvent.controller';
import auth from '../../middleware/auth';
import { UserRole } from '../User/user.utils';

const router = express.Router();

router.post(
  '/',
  auth(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.DRIVER),
  CalendarEventController.createCalendarEvent
);

router.get(
  '/',
  auth(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.DRIVER),
  CalendarEventController.getAllCalendarEvents
);

router.patch(
  '/:id',
  auth(UserRole.SUPERADMIN, UserRole.ADMIN),
  CalendarEventController.updateCalendarEvent
);

router.delete(
  '/:id',
  auth(UserRole.SUPERADMIN, UserRole.ADMIN),
  CalendarEventController.deleteCalendarEvent
);

export const CalendarEventRoutes = router;
