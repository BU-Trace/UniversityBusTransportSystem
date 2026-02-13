import { Router } from 'express';
import auth from '../../middleware/auth';
import { PushController } from './push.controller';

const router = Router();

router.get('/public-key', PushController.getPublicKey);
router.post('/subscribe', auth('admin', 'superadmin', 'driver'), PushController.subscribe);

export default router;
