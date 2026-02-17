import { Router } from 'express';

import { getAIResponse, getChatHistory } from './ai.controller';

const router = Router();

router.post('/prompt', getAIResponse);
router.get('/history', getChatHistory);

export const AiRoutes = router;
export default router;
