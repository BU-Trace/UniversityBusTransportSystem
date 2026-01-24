import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/appError';
import config from '../../config';

import { IAuth, IJwtPayload } from './auth.interface';
import UserModel from '../User/user.model';
import { UserRole } from '../User/user.utils';
import { createToken, verifyToken } from './auth.util';
import bcrypt from 'bcrypt';
import { EmailHelper } from '../../utils/emailHelper';
import { runWithTransaction } from '../../utils/transaction';
import { Bus as BusModel } from '../Bus/bus.model';

const getPendingRegistrations = async () => {
  const pending = await UserModel.find({ isApproved: false, isActive: true })
    .select('-password')
    .sort({ createdAt: -1 });

  return pending;
};

const approveRegistration = async (userId: string, payload: { assignedBusId?: string }) =>
  runWithTransaction(async (session) => {
    const user = await UserModel.findById(userId).session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

    if (!user.isActive) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User email is not verified yet');
    }

    if (user.isApproved) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User already approved');
    }

    if (user.role === 'driver') {
      const assignedBusId = payload?.assignedBusId;
      if (!assignedBusId) {
        throw new AppError(StatusCodes.BAD_REQUEST, 'Assigned bus is required for driver approval');
      }

      const bus = await BusModel.findById(assignedBusId).session(session);
      if (!bus) throw new AppError(StatusCodes.NOT_FOUND, 'Bus not found');

      const alreadyAssigned = await UserModel.findOne({
        role: 'driver',
        assignedBus: bus._id,
        isApproved: true,
      }).session(session);

      if (alreadyAssigned) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'This bus is already assigned to another driver'
        );
      }

      user.assignedBus = bus._id as any;
      user.assignedBusName = `${bus.name} (${bus.plateNumber})`;
    }

    user.isApproved = true;

    await user.save({ session });

    const safe = await UserModel.findById(user._id).select('-password').session(session);

    return safe;
  });

const rejectRegistration = async (userId: string) =>
  runWithTransaction(async (session) => {
    const user = await UserModel.findById(userId).session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

    if (user.isApproved) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Approved users cannot be rejected');
    }

    await UserModel.findByIdAndDelete(userId).session(session);

    return { message: 'Rejected and removed' };
  });

const loginUser = async (payload: IAuth) => {
  return runWithTransaction(async (session) => {
    const user = await UserModel.findOne({ email: payload.email })
      .select('+password')
      .session(session);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    }

    if (!user.isApproved) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');
    }

    const isMatch = await UserModel.isPasswordMatched(payload.password.trim(), user.password);
    if (!isMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Password does not match');
    }

    const jwtPayload: IJwtPayload = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as keyof typeof UserRole,
      isActive: user.isActive,
      iat: Math.floor(Date.now() / 1000),
    };

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

    if (payload.clientInfo) {
      await UserModel.findByIdAndUpdate(
        user._id,
        { clientITInfo: payload.clientInfo, lastLogin: new Date() },
        { new: true, session }
      );
    } else {
      await UserModel.findByIdAndUpdate(
        user._id,
        { lastLogin: new Date() },
        { new: true, session }
      );
    }

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
  });
};

const changePassword = async (payload: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  return runWithTransaction(async (session) => {
    const user = await UserModel.findOne({ email: payload.email })
      .select('+password')
      .session(session);

    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user email is not verified!');
    }

    if (!user.isApproved) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');
    }
    const isMatch = await UserModel.isPasswordMatched(payload.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Old password does not match');
    }

    const hashedPassword = await bcrypt.hash(
      payload.newPassword,
      Number(config.bcrypt_salt_rounds)
    );

    user.password = hashedPassword;
    await user.save({ session });

    return { message: 'Password changed successfully' };
  });
};

const forgetPassword = async (payload: { email: string }) => {
  return runWithTransaction(async (session) => {
    const user = await UserModel.findOne({ email: payload.email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'This user email is not verified!');
    }

    if (!user.isApproved) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');
    }

    const resetSecret = (config.jwt_pass_reset_secret as string) || 'resetPasswordSecret';
    const resetExpiry =
      (config.jwt_pass_reset_expires_in as `${number}${'s' | 'm' | 'h' | 'd'}`) || '15m';

    const token = createToken(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as keyof typeof UserRole,
        isActive: user.isActive,
        iat: Math.floor(Date.now() / 1000),
      },
      resetSecret,
      resetExpiry
    );

    const clientBase = config.client_url || 'http://localhost:3000';
    const resetLink = `${clientBase}/reset-password?token=${token}`;

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
        We received a request to reset your Campus Connect password. If you made this request, please click the button below:
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
        ⚠️ This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="color: #6b7280; font-size: 13px;">
        If you didn’t request a password reset, ignore this email.
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
      <p>© ${new Date().getFullYear()} Campus Connect. All rights reserved.</p>
    </div>
  </div>
  `,
      'Password Reset Request'
    );

    return { message: 'Reset password link has been sent to your email.' };
  });
};

const resetPassword = async (payload: { token: string; newPassword: string }) => {
  return runWithTransaction(async (session) => {
    if (!payload.token) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Reset token is required');
    }

    const decoded = verifyToken(
      payload.token,
      (config.jwt_pass_reset_secret as string) || 'resetPasswordSecret'
    ) as { userId: string } & { email?: string };

    const user = await UserModel.findById(decoded.userId).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User is not found!');
    }

    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    }
    if (!user.isApproved) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');
    }

    user.password = payload.newPassword.trim();
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;

    await user.save({ session });

    return { message: 'Password reset successfully' };
  });
};

export const AuthService = {
  loginUser,
  changePassword,
  forgetPassword,
  resetPassword,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};
