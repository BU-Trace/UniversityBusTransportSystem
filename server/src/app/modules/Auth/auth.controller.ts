import { Request, Response } from 'express';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';
import { AuthService } from './auth.service';

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { refreshToken, accessToken } = result;

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User logged in successfully!',
    data: {
      accessToken,
      refreshToken,
    },
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
  const data = await AuthService.forgetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reset password link has been sent to your email.',
    data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password reset successfully!',
    data,
  });
});

const getPendingRegistrations = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getPendingRegistrations();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Pending registrations fetched successfully',
    data: result,
  });
});

const approveRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.approveRegistration(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User approved successfully',
    data: result,
  });
});

const rejectRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.rejectRegistration(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Registration request rejected',
    data: result,
  });
});

export const AuthController = {
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};
