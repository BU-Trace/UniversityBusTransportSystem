import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../errors/appError';
import config from '../../config';

import { IAuth, IJwtPayload } from './auth.interface';
import UserModel from '../User/user.model';
import { UserRole } from '../User/user.utils';
import { createToken } from './auth.util';
import bcrypt from 'bcrypt';
import { EmailHelper } from '../../utils/emailHelper';

const loginUser = async (payload: IAuth) => {
  const session = await mongoose.startSession();

  console.log(payload);

  try {
    session.startTransaction();

    // ---------------------- Find User ----------------------
    const user = await UserModel.findOne({ email: payload.email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is not active!');
    }

    // ---------------------- Check Password ----------------------

    const isMatch = await UserModel.isPasswordMatched(payload.password.trim(), user.password);
    if (!isMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Password does not match');
    }

    // ---------------------- Prepare JWT Payload ----------------------
    const jwtPayload: IJwtPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as keyof typeof UserRole,
      isActive: user.isActive,
      iat: Math.floor(Date.now() / 1000),
    };

    // ---------------------- Generate Tokens ----------------------
    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as `${number}${'s' | 'm' | 'h' | 'd'}`
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as `${number}${'s' | 'm' | 'h' | 'd'}`
    );

    // ---------------------- Update lastLogin & clientInfo ----------------------
    if (payload.clientInfo) {
      await UserModel.findByIdAndUpdate(
        user._id,
        { clientITInfo: payload.clientInfo, lastLogin: new Date() },
        { new: true, session }
      );
    }

    await session.commitTransaction();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

const changePassword = async (payload: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // ---------------------- Find User ----------------------
    const user = await UserModel.findOne({ email: payload.email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is not active!');
    }

    // ---------------------- Check Old Password ----------------------
    const isMatch = await UserModel.isPasswordMatched(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Old password does not match');
    }

    // ---------------------- Hash New Password ----------------------
    const hashedPassword = await bcrypt.hash(
      payload.newPassword,
      Number(config.bcrypt_salt_rounds)
    );

    user.password = hashedPassword;

    await user.save({ session });

    await session.commitTransaction();

    return {
      message: 'Password changed successfully',
    };
  } catch (error) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

const forgetPassword = async (payload: { email: string }) => {
  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
    // ---------------------- Find User ----------------------
    const user = await UserModel.findOne({ email: payload.email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user is not active!');
    }

    // ---------------------- Generate Reset Token ----------------------
    const token = createToken(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as keyof typeof UserRole,
        isActive: user.isActive,
        iat: Math.floor(Date.now() / 1000),
      },
      'resetPasswordSecret' as string,
      '15m'
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await EmailHelper.sendEmail(
      user.email,
      `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #fff5f5;
    padding: 20px;
    border-radius: 10px;
    border: 1px solid #f5c2c2;
    max-width: 600px;
    margin: 0 auto;
  ">
    <div style="text-align: center; margin-bottom: 20px;">
      <h2 style="color: #b91c1c; margin: 0;">Campus Connect</h2>
      <p style="color: #6b7280; font-size: 14px;">Empowering Students. Connecting Campuses.</p>
    </div>

    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px;">
      <h3 style="color: #dc2626;">Password Reset Request</h3>
      <p style="color: #374151; font-size: 15px;">
        Hi ${user.name || 'there'}, <br/><br/>
        We received a request to reset your Campus Connect password. If you made this request, please click the button below to reset your password:
      </p>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="
          background-color: #ef4444;
          color: #ffffff;
          padding: 12px 25px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
        ">
          Reset Password
        </a>
      </div>

      <p style="color: #4b5563; font-size: 14px;">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetLink}" style="color: #dc2626; word-break: break-all;">${resetLink}</a>
      </p>

      <p style="color: #6b7280; font-size: 13px; margin-top: 15px;">
        ⚠️ This link will expire in <strong>15 minutes</strong> for your security.
      </p>

      <p style="color: #6b7280; font-size: 13px;">
        If you didn’t request a password reset, you can safely ignore this email.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Campus Connect. All rights reserved.</p>
    </div>
  </div>
  `,
      'Password Reset Request'
    );

    await session.commitTransaction();
    return {
      message: 'Reset password link has been sent to your email.',
    };
  } catch (error) {
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Failed to abort transaction:', abortError);
      }
    }
    throw error;
  } finally {
    await session.endSession();
  }
};

export const AuthService = {
  loginUser,
  changePassword,
  forgetPassword,
};
