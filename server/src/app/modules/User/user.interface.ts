import { Document, Model, Types } from 'mongoose';

// --- Roles ----------------------------------------------------
export const USER_ROLES = ['superadmin', 'admin', 'student', 'driver'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type IUserRole = {
  SUPERADMIN: 'superadmin';
  ADMIN: 'admin';
  STUDENT: 'student';
  DRIVER: 'driver';
};

// --- Client IT info (device/browser/ip etc.) ------------------
export type ClientITInfo = {
  device: 'pc' | 'mobile' | 'tablet';
  browser: string;
  ipAddress: string;
  pcName?: string;
  os?: string;
  userAgent?: string;
};

// --- Role-specific client info --------------------------------
type BaseClientInfo = {
  bio?: string;
  department?: string;
  rollNumber?: string;
  licenseNumber?: string;
};

type StudentClientInfo = BaseClientInfo & {
  department?: string;
  rollNumber?: string;
};

type DriverClientInfo = BaseClientInfo & {
  licenseNumber?: string;
};

// --- Core fields shared by all users ---------------------------
interface UserCommon {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  clientITInfo: ClientITInfo;

  lastLogin: Date;
  isActive: boolean;

  otpToken?: string | null;
  otpExpires?: Date | null;

  needPasswordChange?: boolean;
  resetPasswordExpires?: Date | null;
  resetPasswordToken?: string | null;

  profileImage?: string | null;

  // mongoose timestamps
  createdAt: Date;
  updatedAt: Date;
  approvalLetter?: string | null;
  assignedBus?: Types.ObjectId | null;
  assignedBusName?: string | null;

}

// --- Discriminated union by role -------------------------------
// Admins don’t require extra clientInfo, students & drivers do.
export type UserDoc =
  | (UserCommon & {
      role: 'student';
      clientInfo: StudentClientInfo; // required for students
    })
  | (UserCommon & {
      role: 'driver';
      clientInfo: DriverClientInfo; // required for drivers
    })
  | (UserCommon & {
      role: 'admin' | 'superadmin';
      clientInfo?: BaseClientInfo; // optional for admins
    });

// If you prefer interface form that extends mongoose Document:
export interface IUser extends Document<Types.ObjectId>, Omit<UserDoc, '_id'> {}

// --- Model (statics) -------------------------------------------
export interface UserModel extends Model<IUser> {
  // statics (these are better as statics than instance methods)
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;

  // Return null when not found (more accurate for lookups)
  isUserExistsByEmail(email: string): Promise<IUser | null>;
  checkUserExist(userId: string): Promise<IUser | null>;
}
