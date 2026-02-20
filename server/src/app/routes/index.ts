import { Router } from 'express';

import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import StopageRoutes from '../modules/Stopage/stopage.routes';
import RouteRoutes from '../modules/Route/route.routes';
import BusRoutes from '../modules/Bus/bus.routes';
import NotificationRoutes from '../modules/Notification/notification.routes';
import IssueRoutes from '../modules/Issue/issue.routes';
import LocationRoutes from '../modules/location/location.routes';
import AiRoutes from '../modules/AI/ai.routes';
import noticeRoutes from '../modules/Notice/notice.routes';
import PushRoutes from '../modules/Push/push.routes';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.routes';
import { CalendarEventRoutes } from '../modules/CalendarEvent/calendarEvent.routes';
import { DriverRoutes } from '../modules/Driver/driver.routes';

const router = Router();

router.use('/user', UserRoutes);
router.use('/auth', AuthRoutes);
router.use('/stopage', StopageRoutes);
router.use('/route', RouteRoutes);
router.use('/bus', BusRoutes);
router.use('/notification', NotificationRoutes);
router.use('/issue', IssueRoutes);
router.use('/location', LocationRoutes);
router.use('/ai', AiRoutes);
router.use('/notice', noticeRoutes);
router.use('/push', PushRoutes);
router.use('/dashboard', DashboardRoutes);
router.use('/calendar-event', CalendarEventRoutes);
router.use('/driver', DriverRoutes);

export default router;
