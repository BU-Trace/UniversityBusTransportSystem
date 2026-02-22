import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';
import auth from '../../middleware/auth';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

// 🔥 ADD THIS (VERY IMPORTANT)
router.post('/refresh-token', AuthController.refreshToken);

router.post('/change-password', auth(), AuthController.changePassword);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

export const AuthRoutes = router;
export default router;