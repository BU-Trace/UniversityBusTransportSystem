import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import UserModel from './user.model';
import { IUser } from './user.interface';

import config from '../../config';
import { AuthService } from '../Auth/auth.service';

const registerUser = async (userData: Partial<IUser>) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email: userData.email }).session(session);
    if (existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
    }

    if (!userData.password) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
    }

    const hashedPassword = await bcrypt.hash(userData.password, Number(config.bcrypt_salt_rounds));

    const user = new UserModel({
      ...userData,
      password: hashedPassword,
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
  await  session.endSession();
  }
};

export const UserServices = {
  registerUser,
};
