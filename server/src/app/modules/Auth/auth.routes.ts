import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import auth from '../../middleware/auth';
import { UserRole } from '../User/user.utils';


const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/change-password', AuthController.changePassword);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

router.get(
  '/get-pending-registrations',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.getPendingRegistrations
);

router.post(
  '/approve-registration/:id',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.approveRegistration
);

router.delete(
  '/reject-registration/:id',
  auth(UserRole.ADMIN, UserRole.SUPERADMIN),
  AuthController.rejectRegistration
);

export const AuthRoutes = router;