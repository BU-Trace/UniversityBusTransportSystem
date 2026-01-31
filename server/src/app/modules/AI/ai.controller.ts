import { StatusCodes } from 'http-status-codes';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as AIService from './ai.service';

export const getAIResponse = catchAsync(async (req, res) => {
  const result = await AIService.startChat(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'AI response generated',
    data: result,
  });
});
