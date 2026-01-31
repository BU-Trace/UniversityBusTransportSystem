import { Router } from 'express';

import { getAIResponse } from './ai.controller';

const router = Router();

router.post('/prompt', getAIResponse);

export const AiRoutes = router;
export default router;
