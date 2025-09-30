import { Router } from 'express';
import { AuthController } from './auth.controller';
import clientInfoParser from '../../middleware/clientInfoParser';

const router = Router();

router.post('/login', clientInfoParser, AuthController.loginUser);

export const AuthRoutes = router;
