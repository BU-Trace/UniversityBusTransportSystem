import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserServices } from './user.service';

const registerUser = catchAsync(async (req: Request, res: Response) => {
  await UserServices.registerUser(req.body);

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

// GET /user/get-all-users
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users fetched successfully',
    data: result,
  });
});

// POST /user/add-user
const adminCreateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.adminCreateUser(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

// PUT /user/update-user/:id
const adminUpdateUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.adminUpdateUser(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const adminDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.adminDeleteUser(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const UserController = {
  registerUser,
  verifyEmail,

  updateAdminProfile,
  updateStudentProfile,
  updateDriverProfile,

  getAllUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
};
