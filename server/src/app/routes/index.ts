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

const router = Router();

const moduleRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/stopage',
    route: StopageRoutes,
  },
  {
    path: '/route',
    route: RouteRoutes,
  },
  {
    path: '/bus',
    route: BusRoutes,
  },
  {
    path: '/notification',
    route: NotificationRoutes,
  },
  {
    path: '/issue',
    route: IssueRoutes,
  },
  {
    path: '/location',
    route: LocationRoutes,
  },
  {
    path: '/ai',
    route: AiRoutes,
  },
  {
    path: '/notice',
    route: noticeRoutes,
  },
  {
    path: '/push',
    route: PushRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/calendar-event',
    route: CalendarEventRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;