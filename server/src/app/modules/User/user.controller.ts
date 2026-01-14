import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserServices } from './user.service';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  await UserServices.registerUser(req.body);

  // const { refreshToken, accessToken } = result;
  //
  // res.cookie('refreshToken', refreshToken, {
  //   secure: config.NODE_ENV === 'production',
  //   httpOnly: true,
  //   sameSite: 'none',
  //   maxAge: 1000 * 60 * 60 * 24 * 365,
  // });
  //
  // sendResponse(res, {
  //   statusCode: StatusCodes.OK,
  //   success: true,
  //   message: 'User registration completed successfully!',
  //   data: {
  //     accessToken,
  //   },
  // });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Registration completed successfully.',
    data: null,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.verifyEmail(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Email verified successfully!',
    data: result,
  });
});

const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateProfile(req.params.id, req.body, 'admin');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin profile updated successfully',
    data: result,
  });
});

const updateStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateProfile(req.params.id, req.body, 'student');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Student profile updated successfully',
    data: result,
  });
});

const updateDriverProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.updateProfile(req.params.id, req.body, 'driver');
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Driver profile updated successfully',
    data: result,
  });
});

export const UserController = {
  registerUser,
  verifyEmail,
  updateAdminProfile,
  updateStudentProfile,
  updateDriverProfile,
};
