import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

router.post('/change-password', AuthController.changePassword);

router.post('/forget-password', AuthController.forgetPassword);

router.post('/reset-password', AuthController.resetPassword);

export const AuthRoutes = router;
