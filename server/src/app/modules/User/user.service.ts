import AppError from '../../errors/appError';
import { StatusCodes } from 'http-status-codes';
import UserModel from './user.model';
import { IUser, UserRole } from './user.interface';

import { EmailHelper } from '../../utils/emailHelper';
import { runWithTransaction } from '../../utils/transaction';

// Update driver status (active/inactive or custom status)
const updateDriverStatus = async (driverId: string, status: any) => {
  const driver = await UserModel.findById(driverId);
  if (!driver || driver.role !== 'driver') {
    throw new AppError(StatusCodes.NOT_FOUND, 'Driver not found');
  }
  // Only allow updating isActive (boolean)
  if (typeof status === 'boolean') {
    driver.isActive = status;
  } else {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Status must be a boolean (active/inactive)');
  }
  await driver.save();
  return driver;
};

type ClientInfo = NonNullable<IUser['clientInfo']>;

const ROLE_CLIENT_FIELDS: Record<UserRole, (keyof ClientInfo)[]> = {
  student: ['bio', 'department', 'rollNumber'],
  driver: ['bio', 'licenseNumber'],
  admin: ['bio'],
  superadmin: ['bio'],
  // staff: ['bio', 'department', 'designation'],
};

const getClientInfoForUpdate = (user: IUser, role: UserRole): ClientInfo => {
  if (!user.clientInfo) {
    user.clientInfo = {} as ClientInfo;

    if (role === 'student') {
      user.clientInfo = { ...(user.clientInfo as any) } as ClientInfo;
    }
    if (role === 'driver') {
      user.clientInfo = { ...(user.clientInfo as any) } as ClientInfo;
    }
  }

  return user.clientInfo as ClientInfo;
};

const applyClientInfoUpdates = (
  clientInfo: ClientInfo,
  updates: Partial<ClientInfo> | undefined,
  allowedFields: (keyof ClientInfo)[]
) => {
  if (!updates) return;

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      clientInfo[field] = updates[field];
    }
  });
};

const generateTempPassword = (len = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
};

export const updateProfile = async (userId: string, data: Partial<IUser>, role: UserRole) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.role !== role) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Role mismatch');
  }

  // Common fields
  if (data.name !== undefined) {
    user.name = data.name;
  }

  if (data.profileImage !== undefined) {
    user.profileImage = data.profileImage;
  }

  const clientInfo = getClientInfoForUpdate(user, user.role);
  applyClientInfoUpdates(
    clientInfo,
    data.clientInfo as Partial<ClientInfo>,
    ROLE_CLIENT_FIELDS[user.role]
  );

  await user.save();
  return user;
};

const registerUser = async (userData: Partial<IUser>) =>
  runWithTransaction(async (session) => {
    const email = userData.email?.trim().toLowerCase();
    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');

    if (!userData.password) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');
    }

    const password = userData.password.trim();

    if (!password) throw new AppError(StatusCodes.BAD_REQUEST, 'Password is required');

    const role = userData.role as UserRole;
    if (!role) throw new AppError(StatusCodes.BAD_REQUEST, 'Role is required');

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
    }

    if (role === 'student') {
      const department = (userData.clientInfo as any)?.department?.toString().trim();
      const rollNumber = (userData.clientInfo as any)?.rollNumber?.toString().trim();
      if (!department) throw new AppError(StatusCodes.BAD_REQUEST, 'Department is required');
      if (!rollNumber) throw new AppError(StatusCodes.BAD_REQUEST, 'Roll number is required');
    }

    if (role === 'driver') {
      const licenseNumber = (userData.clientInfo as any)?.licenseNumber?.toString().trim();
      if (!licenseNumber) throw new AppError(StatusCodes.BAD_REQUEST, 'License number is required');
    }
    // if (role === 'staff') {
    //     const department = (userData.clientInfo as any)?.department?.toString().trim();
    //     const designation = (userData.clientInfo as any)?.designation?.toString().trim();

    //     if (!department) throw new AppError(StatusCodes.BAD_REQUEST, 'Department is required');
    //     if (!designation) throw new AppError(StatusCodes.BAD_REQUEST, 'Designation is required');
    //   }

    const OTP = Math.floor(100000 + Math.random() * 900000);
    const otpToken = String(OTP);
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = new UserModel({
      name: userData.name,
      email: userData.email,
      role: userData.role,

      clientInfo: userData.clientInfo,
      clientITInfo: userData.clientITInfo,

      password: password,
      isActive: false,
      isApproved: false,

      otpToken: String(OTP),
      otpExpires: new Date(Date.now() + 15 * 60 * 1000),
    });

    await user.save({ session });

    try {
      await EmailHelper.sendEmail(
        email,
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
        Use the OTP below to verify your email. This code will expire in <strong>15 minutes</strong>.
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
        ${otpToken}
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
    } catch (e) {}

    return null;
  });

const verifyEmail = async (payload: { email: string; otpToken: string }) =>
  runWithTransaction(async (session) => {
    const email = payload.email?.trim().toLowerCase();
    const otp = payload.otpToken?.trim();

    if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');
    if (!otp) throw new AppError(StatusCodes.BAD_REQUEST, 'OTP token is required');

    const user = await UserModel.findOne({ email }).session(session);
    if (!user) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (user.isActive) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'User already verified');
    }

    if (!user.otpToken || user.otpToken !== otp) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid OTP token');
    }

    const now = new Date();
    if (!user.otpExpires || user.otpExpires < now) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'OTP token has expired');
    }

    user.isActive = true;
    user.isApproved = true;
    user.otpToken = null;
    user.otpExpires = null;

    await user.save({ session });

    return {
      message: 'Email verified successfully',
    };
  });

/* =========================================================
   DASHBOARD CRUD (Admin)
========================================================= */

const getAllUsers = async () => {
  const users = await UserModel.find().select('-password').sort({ createdAt: -1 });

  return users;
};

// Admin creates user (dashboard add)
const adminCreateUser = async (payload: any) => {
  const email = payload.email?.trim().toLowerCase();
  if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');

  const exists = await UserModel.findOne({ email });
  if (exists) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
  }

  const tempPassword = generateTempPassword(10);
  const role: UserRole = payload.role;

  const userDoc: Partial<IUser> = {
    email,
    password: tempPassword,
    name: payload.name,
    role,
    isActive: true,
    isApproved: true, // ✅ admin created means approved
    needPasswordChange: true,

    profileImage: payload.profileImage ?? null,
    approvalLetter: payload.approvalLetter ?? null,

    assignedBus: payload.assignedBus ?? null,
    assignedBusName: payload.assignedBusName ?? null,

    clientInfo: payload.clientInfo ?? {},
  };

  if ((role === 'admin' || role === 'superadmin' || role === 'driver') && !userDoc.profileImage) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Photo is required for admin/driver');
  }
  if ((role === 'admin' || role === 'superadmin' || role === 'driver') && !userDoc.approvalLetter) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Approval letter is required for admin/driver');
  }
  if (role === 'driver' && !userDoc.assignedBus) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Assigned bus is required for driver');
  }

  const created = await UserModel.create(userDoc);

  try {
    await EmailHelper.sendEmail(
      created.email,
      `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h3>Campus Connect - Account Created</h3>
        <p>Hello ${created.name || ''},</p>
        <p>An admin has created your account.</p>
        <p><b>Temporary Password:</b> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
      </div>
      `,
      'Campus Connect Account Created'
    );
  } catch (e) {}

  const safe = await UserModel.findById(created._id).select('-password');
  return safe;
};

// Admin creates a driver (dedicated flow)
const adminCreateDriver = async (payload: any) => {
  const email = payload.email?.trim().toLowerCase();
  if (!email) throw new AppError(StatusCodes.BAD_REQUEST, 'Email is required');

  const exists = await UserModel.findOne({ email });
  if (exists) {
    throw new AppError(StatusCodes.NOT_ACCEPTABLE, 'Email is already registered');
  }

  const tempPassword = generateTempPassword(10);

  const userDoc: Partial<IUser> = {
    email,
    password: tempPassword,
    name: payload.name,
    role: 'driver',
    isActive: true,
    isApproved: true,
    needPasswordChange: true,

    profileImage: payload.profileImage,
    approvalLetter: payload.approvalLetter,

    assignedBus: payload.assignedBus,
    assignedBusName: payload.assignedBusName ?? null,

    clientInfo: payload.clientInfo ?? {},
  };

  if (!userDoc.profileImage) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Driver photo is required');
  }
  if (!userDoc.approvalLetter) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Approval letter is required');
  }
  if (!userDoc.assignedBus) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Assigned bus is required for driver');
  }

  const created = await UserModel.create(userDoc);

  try {
    await EmailHelper.sendEmail(
      created.email,
      `
      <div style="font-family: Arial, sans-serif; line-height:1.6;">
        <h3>Campus Connect - Driver Account Created</h3>
        <p>Hello ${created.name || ''},</p>
        <p>An admin has created your driver account.</p>
        <p><b>Temporary Password:</b> ${tempPassword}</p>
        <p>Please login and change your password immediately.</p>
      </div>
      `,
      'Campus Connect Driver Account Created'
    );
  } catch (e) {}

  const safe = await UserModel.findById(created._id).select('-password');
  return safe;
};

// Admin updates user (dashboard edit)
const adminUpdateUser = async (id: string, payload: any) => {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  const role: UserRole = payload.role ?? user.role;

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.email !== undefined) user.email = payload.email.trim().toLowerCase();

  if (payload.profileImage !== undefined) user.profileImage = payload.profileImage;
  if (payload.approvalLetter !== undefined) user.approvalLetter = payload.approvalLetter;

  if (payload.clientInfo !== undefined) {
    if (!user.clientInfo) user.clientInfo = {} as any;
    user.clientInfo = { ...(user.clientInfo as any), ...(payload.clientInfo as any) };
  }

  if (role === 'driver') {
    if (payload.assignedBus !== undefined) user.assignedBus = payload.assignedBus;
    if (payload.assignedBusName !== undefined) user.assignedBusName = payload.assignedBusName;
  } else {
    if (payload.assignedBus !== undefined) user.assignedBus = null;
    if (payload.assignedBusName !== undefined) user.assignedBusName = null;
  }

  user.role = role;

  await user.save();
  const safe = await UserModel.findById(user._id).select('-password');
  return safe;
};

// Admin deletes user
const adminDeleteUser = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(StatusCodes.NOT_FOUND, 'User not found');

  await UserModel.findByIdAndDelete(id);
  return { message: 'Deleted successfully' };
};

// Get all drivers
const getAllDrivers = async () => {
  return await UserModel.find({ role: 'driver' }).select('-password').sort({ createdAt: -1 });
};

// Get all students
const getAllStudents = async () => {
  return await UserModel.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
};

export const UserServices = {
  registerUser,
  verifyEmail,
  updateProfile,

  getAllUsers,
  adminCreateUser,
  adminCreateDriver,
  adminUpdateUser,
  adminDeleteUser,
  getAllDrivers,
  getAllStudents,
  updateDriverStatus,
};
