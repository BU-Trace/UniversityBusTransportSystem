import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import StopageRoutes from '../modules/Stopage/stopage.routes';
import RouteRoutes from '../modules/Route/route.routes';
import BusRoutes from '../modules/Bus/bus.routes';
import NotificationRoutes from '../modules/Notification/notification.routes';
import IssueRoutes from '../modules/Issue/issue.routes';
import LocationRoutes from '../modules/location/location.routes';
import chatbotRoutes from "../modules/Chatbot/chatbot.routes";

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
    path: '/chatbot',
    route: chatbotRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
