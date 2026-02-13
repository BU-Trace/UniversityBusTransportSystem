import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import auth from '../../middleware/auth';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/change-password', auth(), AuthController.changePassword);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

// DECOMMISSIONED: registration-related routes

/**
 * ✅ Export both ways so you can import safely using either:
 *   import AuthRoutes from ...
 *   import { AuthRoutes } from ...
 */
export const AuthRoutes = router;
export default router;
