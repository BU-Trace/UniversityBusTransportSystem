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

  // ✅ DEV friendly cookie settings
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully!',
    data: { accessToken },
  });
});

// ✅ NEW: refresh access token using refreshToken cookie
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies?.refreshToken;
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
  const result = await AuthService.changePassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body.email);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reset password link sent successfully!',
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

const getPendingRegistrations = catchAsync(async (_req: Request, res: Response) => {
  const result = await AuthService.getPendingRegistrations();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Pending registrations fetched successfully!',
    data: result,
  });
});

const approveRegistration = catchAsync(async (req: Request, res: Response) => {
  const actorRole = (req.user as any)?.role; // admin or superadmin (auth middleware guarantees)
  const result = await AuthService.approveRegistration(req.params.id, req.body, actorRole);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Registration approved successfully!',
    data: result,
  });
});

const rejectRegistration = catchAsync(async (req: Request, res: Response) => {
  const actorRole = (req.user as any)?.role;
  const result = await AuthService.rejectRegistration(req.params.id, actorRole);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Registration rejected successfully!',
    data: result,
  });
});

export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,

  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};
