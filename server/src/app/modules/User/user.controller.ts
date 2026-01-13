import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserServices } from './user.service';
import { UserRole } from './user.utils';

const createProfileUpdater = (
  role: (typeof UserRole)[keyof typeof UserRole],
  successMessage: string
) =>
  catchAsync(async (req: Request, res: Response) => {
    const result = await UserServices.updateProfile(req.params.id, req.body, role);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: successMessage,
      data: result,
    });
  });

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

const updateAdminProfile = createProfileUpdater(
  UserRole.ADMIN,
  'Admin profile updated successfully'
);

const updateStudentProfile = createProfileUpdater(
  UserRole.STUDENT,
  'Student profile updated successfully'
);

const updateDriverProfile = createProfileUpdater(
  UserRole.DRIVER,
  'Driver profile updated successfully'
);

export const UserController = {
  registerUser,
  verifyEmail,
  updateAdminProfile,
  updateStudentProfile,
  updateDriverProfile,
};
