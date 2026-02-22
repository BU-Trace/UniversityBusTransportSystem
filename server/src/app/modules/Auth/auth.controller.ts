//22-2-26

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import AppError from '../../errors/appError';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  // Cookie সেট করা হচ্ছে (DEV friendly)
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // 🔥 CHANGED
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 🔥 CHANGED
  path: '/',
});
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully!',
    data: { accessToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
const refreshTokenFromCookie =
  req.cookies?.refreshToken ||
  req.headers.authorization;

  if (!refreshTokenFromCookie) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token not found');
  }

  const data = await AuthService.refreshAccessToken(refreshTokenFromCookie);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Access token refreshed successfully!',
    data,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const email = req.user?.email;

  if (!email) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'User email not found');
  }

  const result = await AuthService.changePassword({
    email,
    oldPassword,
    newPassword,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reset password link sent!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};