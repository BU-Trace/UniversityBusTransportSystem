
import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { UserServices } from './user.service';
import { UserRole } from './user.utils';
import type { UserRole as UserRoleType } from './user.interface';

const createProfileUpdater = (
  role: UserRoleType,
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

// PATCH /user/driver/:id/status
const updateDriverStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserServices.updateDriverStatus(id, status);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Driver status updated successfully',
    data: result,
  });
});


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

// POST /user/add-driver (admin only)
const adminCreateDriver = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.adminCreateDriver(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Driver created successfully',
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

const getAllDrivers = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserServices.getAllDrivers();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Drivers fetched successfully',
    data: result,
  });
});

const getAllStudents = catchAsync(async (_req: Request, res: Response) => {
  const result = await UserServices.getAllStudents();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Students fetched successfully',
    data: result,
  });
});

export const UserController = {
  registerUser,
  verifyEmail,

  updateAdminProfile,
  updateStudentProfile,
  updateDriverProfile,

  updateDriverStatus,

  getAllUsers,
  adminCreateUser,
  adminCreateDriver,
  adminUpdateUser,
  adminDeleteUser,
  getAllDrivers,
  getAllStudents,
};
