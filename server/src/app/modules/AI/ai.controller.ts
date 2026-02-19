import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import * as AIService from './ai.service';
export const getChatHistory = catchAsync(async (req, res) => {
  const userId = req.user?.userId;
  const sessionId =
    (req.headers['x-session-id'] as string) || req.cookies?.sessionId || req.query.sessionId;
  const { ChatSession } = await import('./ai.model');
  let session = null;
  if (userId) {
    session = await ChatSession.findOne({ userId });
  } else if (sessionId) {
    session = await ChatSession.findOne({ sessionId });
  }
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Chat history fetched',
    data: session?.history || [],
  });
});
import { StatusCodes } from 'http-status-codes';

export const getAIResponse = catchAsync(async (req, res) => {
  // Use userId if logged in, otherwise use sessionId from request (header or cookie or body)
  const userId = req.user?.userId;
  // Try to get sessionId from header, cookie, or body (fallback)
  const sessionId =
    (req.headers['x-session-id'] as string) || req.cookies?.sessionId || req.body.sessionId;

  const result = await AIService.startChat(req.body, userId, sessionId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'AI response generated',
    data: result,
  });
});
