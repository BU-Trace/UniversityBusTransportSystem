import { Router } from 'express';
import auth from '../../middleware/auth';
import { UserRole } from '../User/user.utils';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get('/stats', auth(UserRole.ADMIN, UserRole.SUPERADMIN), DashboardController.getStats);

export const DashboardRoutes = router;
