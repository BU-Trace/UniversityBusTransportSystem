import { Router } from 'express';
import { PushController } from './push.controller';

const router = Router();

router.get('/public-key', PushController.getPublicKey);
router.post('/subscribe', PushController.subscribe);

export default router;
