import { AuthService } from './auth.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import config from '../../config';

const loginUser = catchAsync(async (req, res) => {
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

const changePassword = catchAsync(async (req, res) => {
  const result = await AuthService.changePassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully!',
    data: result,
  });
});

const forgetPassword = catchAsync(async (req, res) => {
  const data = AuthService.forgetPassword(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.NOT_IMPLEMENTED,
    success: false,
    message: 'Reset password has been sent to you email.',
    data: data,
  });
});

export const AuthController = {
  loginUser,
  changePassword,
  forgetPassword,
};
