import { Router } from 'express';
import { UserRoutes } from '../modules/User/user.routes';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import StopageRoutes from '../modules/Stopage/stopage.routes';
import RouteRoutes from '../modules/Route/route.routes';
import BusRoutes from '../modules/Bus/bus.routes';



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

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
