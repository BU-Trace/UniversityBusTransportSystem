import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import config from '../../config';
import AppError from '../../errors/appError';
import { runWithTransaction } from '../../utils/transaction';
import { EmailHelper } from '../../utils/emailHelper';
import UserModel from '../User/user.model';
import { Bus as BusModel } from '../Bus/bus.model';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

type UserRole = 'student' | 'driver' | 'admin' | 'superadmin';

type LoginPayload = {
  email: string;
  password: string;
  role: UserRole;
};

type JwtPayloadShape = {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type ReqUser =
  | {
      userId: string;
      name: string;
      email: string;
      role: UserRole;
      isActive: boolean;
    }
  | undefined;

const signToken = (payload: object, secretRaw: string | undefined, expiresInRaw: unknown) => {
  if (!secretRaw) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, 'JWT secret is missing');
  }

  // jsonwebtoken types expect expiresIn to be SignOptions["expiresIn"]
  const options: SignOptions = {};

  if (expiresInRaw) {
    options.expiresIn = expiresInRaw as SignOptions['expiresIn'];
  }

  return jwt.sign(payload, secretRaw as Secret, options);
};

const verifyToken = <T>(token: string, secret: string) => {
  return jwt.verify(token, secret) as T;
};

const getPendingRegistrations = async (requester: ReqUser) => {
  if (!requester) throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');

  // ✅ both admin + superadmin can view pending
  if (requester.role !== 'admin' && requester.role !== 'superadmin') {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  // pending = verified email but not approved
  const pending = await UserModel.find({
    isActive: true,
    isApproved: false,
  }).sort({ createdAt: -1 });

  // You can filter here if you want admins not to even SEE admin-role pendings:
  // if (requester.role === "admin") pending = pending.filter(u => u.role !== "admin" && u.role !== "superadmin");

  return pending;
};

const approveRegistration = async (
  id: string,
  body: { assignedBusId?: string },
  requester: ReqUser
) => {
  if (!requester) throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');

  if (requester.role !== 'admin' && requester.role !== 'superadmin') {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  return runWithTransaction(async (session) => {
    const user = await UserModel.findById(id).session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

    // must be verified first
    if (!user.isActive) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User email is not verified yet');
    }

    // already approved
    if (user.isApproved) {
      return user;
    }

    // ✅ RULE: admin cannot approve admin/superadmin
    if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only superadmin can approve admin accounts');
    }

    // driver requires bus
    if (user.role === 'driver') {
      if (!body?.assignedBusId) {
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          'assignedBusId is required for driver approval'
        );
      }
      const bus = await BusModel.findById(body.assignedBusId).session(session);
      if (!bus) throw new AppError(StatusCodes.NOT_FOUND, 'Bus not found');

      user.assignedBus = bus._id;
      user.assignedBusName = `${bus.name} (${bus.plateNumber})`;
    }

    user.isApproved = true;
    await user.save({ session });

    return user;
  });
};

const rejectRegistration = async (id: string, requester: ReqUser) => {
  if (!requester) throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');

  if (requester.role !== 'admin' && requester.role !== 'superadmin') {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
  }

  return runWithTransaction(async (session) => {
    const user = await UserModel.findById(id).session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

    // ✅ RULE: admin cannot reject admin/superadmin (keep consistent)
    if (requester.role === 'admin' && (user.role === 'admin' || user.role === 'superadmin')) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Only superadmin can reject admin accounts');
    }

    // ✅ your requested behavior:
    // reject = keep isApproved false and make isActive false so they must register again
    user.isApproved = false;
    user.isActive = false;

    // optional cleanup
    user.otpToken = null;
    user.otpExpires = null;

    await user.save({ session });
    return { message: 'Rejected successfully' };
  });
};

const loginUser = async (payload: LoginPayload) => {
  return runWithTransaction(async (session) => {
    const email = payload.email?.trim().toLowerCase();
    const password = payload.password;

    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');
    if (!password) throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');

    const user = await UserModel.findOne({ email }).select('+password').session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');

    // must verify email
    if (!user.isActive) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    }

    // if approved required for login (your system behavior)
    if (!user.isApproved) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');
    }

    // ✅ fix: use bcrypt directly (no missing model method typing)
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new AppError(StatusCodes.FORBIDDEN, 'Password does not match');
    }

    const jwtPayload: JwtPayloadShape = {
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      isActive: user.isActive,
    };

    const accessToken = signToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string
    );

    const refreshToken = signToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string
    );

    // update last login
    user.lastLogin = new Date();
    await user.save({ session });

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

const refreshAccessToken = async (tokenFromCookie: string | undefined) => {
  if (!tokenFromCookie) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Refresh token missing');
  }

  let decoded: JwtPayloadShape;
  try {
    decoded = verifyToken<JwtPayloadShape>(tokenFromCookie, config.jwt_refresh_secret as string);
  } catch (e) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid refresh token');
  }

  const user = await UserModel.findOne({ email: decoded.email }).select('+password');
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
  if (!user.isActive) throw new AppError(StatusCodes.UNAUTHORIZED, 'User is not active');
  if (!user.isApproved) throw new AppError(StatusCodes.UNAUTHORIZED, 'User is not approved');

  const jwtPayload: JwtPayloadShape = {
    userId: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    isActive: user.isActive,
  };

  const accessToken = signToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return { accessToken };
};

const changePassword = async (payload: {
  email: string;
  oldPassword: string;
  newPassword: string;
}) => {
  return runWithTransaction(async (session) => {
    const email = payload.email?.trim().toLowerCase();
    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');

    const user = await UserModel.findOne({ email }).select('+password').session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');

    if (!user.isActive) throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    if (!user.isApproved)
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');

    const ok = await bcrypt.compare(payload.oldPassword, user.password);
    if (!ok) throw new AppError(StatusCodes.FORBIDDEN, 'Old password does not match');

    user.password = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));
    await user.save({ session });

    return { message: 'Password changed successfully' };
  });
};

const forgetPassword = async (payload: { email: string }) => {
  return runWithTransaction(async (session) => {
    const email = payload.email?.trim().toLowerCase();
    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');

    const user = await UserModel.findOne({ email }).session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    if (!user.isActive) throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    if (!user.isApproved)
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');

    const token = signToken(
      {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        isActive: user.isActive,
      },
      (config.jwt_pass_reset_secret as string) || 'resetSecret',
      (config.jwt_pass_reset_expires_in as string) || '15m'
    );

    const clientBase = config.client_url || 'http://localhost:3000';
    const resetLink = `${clientBase}/reset-password?token=${token}`;

    try {
      await EmailHelper.sendEmail(
        user.email,
        `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h3>Campus Connect - Password Reset</h3>
          <p>Hello ${user.name || ''},</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you did not request this, ignore this email.</p>
        </div>
        `,
        'Campus Connect Password Reset'
      );
    } catch (e) {
      // do not reveal email failure
    }

    return { message: 'If an account exists, a reset link was sent.' };
  });
};

const resetPassword = async (payload: { token: string; newPassword: string }) => {
  return runWithTransaction(async (session) => {
    if (!payload.token) throw new AppError(StatusCodes.BAD_REQUEST, 'Token is required');
    if (!payload.newPassword)
      throw new AppError(StatusCodes.BAD_REQUEST, 'New password is required');

    let decoded: JwtPayloadShape;
    try {
      decoded = verifyToken<JwtPayloadShape>(
        payload.token,
        (config.jwt_pass_reset_secret as string) || 'resetSecret'
      );
    } catch (e) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid/Expired token');
    }

    const user = await UserModel.findOne({ email: decoded.email })
      .select('+password')
      .session(session);
    if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
    if (!user.isActive) throw new AppError(StatusCodes.FORBIDDEN, 'Email is not verified!');
    if (!user.isApproved)
      throw new AppError(StatusCodes.FORBIDDEN, 'Account is pending admin approval!');

    user.password = await bcrypt.hash(payload.newPassword, Number(config.bcrypt_salt_rounds));
    await user.save({ session });

    return { message: 'Password reset successfully' };
  });
};

export const AuthService = {
  loginUser,
  refreshAccessToken,
  changePassword,
  forgetPassword,
  resetPassword,

  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};
