import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import AppError from '../../errors/appError';
import config from '../../config';

import { IAuth, IJwtPayload } from './auth.interface';
import UserModel from '../User/user.model';
import { UserRole } from '../User/user.utils';
import { createToken } from './auth.util';

const loginUser = async (payload: IAuth) => {
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

    // ---------------------- Check Password ----------------------
    const isMatch = await UserModel.isPasswordMatched(payload.password, user.password);
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
      await session.abortTransaction();
    }
    throw error;
  } finally {
    session.endSession();
  }
};

export const AuthService = {
  loginUser,
};
