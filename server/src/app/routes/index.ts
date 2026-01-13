import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import StopageRoutes from '../modules/Stopage/stopage.routes';
import RouteRoutes from '../modules/Route/route.routes';

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
