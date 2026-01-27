import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AuthService } from "./auth.service";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  // set refresh token cookie
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days (cookie lifetime)
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  const result = await AuthService.refreshToken(token);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token refreshed",
    data: {
      accessToken: result.accessToken,
    },
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.changePassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

const getPendingRegistrations = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getPendingRegistrations(req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Pending registrations fetched successfully",
    data: result,
  });
});

const approveRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.approveRegistration(req.params.id, req.body, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Registration approved successfully",
    data: result,
  });
});

const rejectRegistration = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.rejectRegistration(req.params.id, req.user);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Registration rejected successfully",
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
