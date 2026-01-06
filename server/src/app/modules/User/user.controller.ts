import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import config from '../../config';
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

export const UserController = {
  registerUser,
  verifyEmail
};
