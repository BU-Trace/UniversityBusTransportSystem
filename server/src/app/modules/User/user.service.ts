import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import UserModel from './user.model';
import { IUser, UserRole } from './user.interface';

import config from '../../config';
import { AuthService } from '../Auth/auth.service';
import { EmailHelper } from '../../utils/emailHelper';
import User from './user.model';

 

export const updateProfile = async (
  userId: string,
  data: Partial<IUser>,
  role: UserRole
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.role !== role) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Role mismatch');
  }

  /* ----------------------------------------------------
     Common fields (allowed for all roles)
  ---------------------------------------------------- */
  if (data.name !== undefined) {
    user.name = data.name;
  }

  if (data.profileImage !== undefined) {
    user.profileImage = data.profileImage;
  }

  /* ----------------------------------------------------
     STUDENT → only student fields
  ---------------------------------------------------- */
  if (user.role === 'student') {
    if (!user.clientInfo) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Student client info missing');
    }

    if (data.clientInfo?.bio !== undefined) {
      user.clientInfo.bio = data.clientInfo.bio;
    }

    if (data.clientInfo?.department !== undefined) {
      user.clientInfo.department = data.clientInfo.department;
    }

    if (data.clientInfo?.rollNumber !== undefined) {
      user.clientInfo.rollNumber = data.clientInfo.rollNumber;
    }
  }

  /* ----------------------------------------------------
     DRIVER → only driver fields
  ---------------------------------------------------- */
  if (user.role === 'driver') {
    if (!user.clientInfo) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Driver client info missing');
    }

    if (data.clientInfo?.bio !== undefined) {
      user.clientInfo.bio = data.clientInfo.bio;
    }

    if (data.clientInfo?.licenseNumber !== undefined) {
      user.clientInfo.licenseNumber = data.clientInfo.licenseNumber;
    }
  }

  /* ----------------------------------------------------
     ADMIN / SUPERADMIN → update driver info
  ---------------------------------------------------- */
  if (user.role === 'admin' || user.role === 'superadmin') {
    if (!user.clientInfo) {
      user.clientInfo = {};
    }

    if (data.clientInfo?.bio !== undefined) {
      user.clientInfo.bio = data.clientInfo.bio;
    }

    if (data.clientInfo?.licenseNumber !== undefined) {
      user.clientInfo.licenseNumber = data.clientInfo.licenseNumber;
    }
  }

  await user.save();
  return user;
};


const registerUser = async (userData: Partial<IUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email: userData.email }).session(session);
    if (existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
    }

    if (!userData.email) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');
    }

    if (!userData.password) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
    }
    const OPT = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    await EmailHelper.sendEmail(
      userData.email,
      `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f9fafb;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
    max-width: 600px;
    margin: 0 auto;
  ">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #ef4444; margin: 0;">Campus Connect</h2>
      <p style="color: #6b7280; font-size: 14px;">Empowering Students. Connecting Campuses.</p>
    </div>

    <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; text-align: center;">
      <h3 style="color: #dc2626; margin-bottom: 20px;">Your One-Time Password (OTP)</h3>
      <p style="color: #374151; font-size: 15px; margin-bottom: 25px;">
        Hi ${userData.name || 'there'},<br/>
        Use the OTP below to complete your action. This code will expire in <strong>15 minutes</strong>.
      </p>

      <div style="
        background-color: #fef2f2;
        border: 1px dashed #ef4444;
        padding: 15px 0;
        border-radius: 6px;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 4px;
        color: #b91c1c;
        width: 180px;
        margin: 0 auto 20px auto;
      ">
        ${OPT}
      </div>

      <p style="color: #4b5563; font-size: 14px;">
        If you did not request this OTP, please ignore this email.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Campus Connect. All rights reserved.</p>
    </div>
  </div>
  `,
      'Your Campus Connect OTP'
    );

    const user = new UserModel({
      ...userData,
      password: userData.password.trim(),
      isActive: false,
      clientITInfo: userData.clientITInfo,
    });

    await user.save({ session });

    await session.commitTransaction();

    // const loginResponse = await AuthService.loginUser({
    //   email: createdUser.email,
    //   password: userData.password,
    //   clientInfo: userData.clientITInfo,
    // });
    //
    // return loginResponse;
    return null;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

const verifyEmail = async (payload: { email: string; otpToken: string }) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await UserModel.findOne({ email: payload.email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.otpToken !== payload.otpToken) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP token');
    }

    const now = new Date();
    if (!user.otpExpires || user.otpExpires < now) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'OTP token has expired');
    }

    user.isActive = true;
    user.otpToken = null;
    user.otpExpires = null;

    await user.save({ session });

    await session.commitTransaction();

    return {
      message: 'Email verified successfully',
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const UserServices = {
  registerUser,
  verifyEmail,
  updateProfile,
};
