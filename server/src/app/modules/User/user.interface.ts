import { Document, Model, Types } from 'mongoose';

// --- Roles ----------------------------------------------------
export const USER_ROLES = ['superadmin', 'admin', 'student', 'driver','staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type IUserRole = {
  SUPERADMIN: 'superadmin';
  ADMIN: 'admin';
  STUDENT: 'student';
  DRIVER: 'driver';
  STAFF: 'staff';
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
  designation?: string;
};

type StudentClientInfo = BaseClientInfo & {
  department?: string;
  rollNumber?: string;
};

type DriverClientInfo = BaseClientInfo & {
  licenseNumber?: string;
};
type StaffClientInfo = BaseClientInfo & {
  department?: string;
  designation?: string;
};

interface UserCommon {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  clientITInfo: ClientITInfo;

  lastLogin: Date;
  isActive: boolean;
  isApproved: boolean;

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

export type UserDoc =
  | (UserCommon & {
      role: 'student';
      clientInfo: StudentClientInfo; // required for students
    })
  | (UserCommon & {
      role: 'staff'; // ✅ Update: Added Staff Role Block
      clientInfo: StaffClientInfo; // required for staff
    })
  | (UserCommon & {
      role: 'driver';
      clientInfo: DriverClientInfo; // required for drivers
    })
  | (UserCommon & {
      role: 'admin' | 'superadmin';
      clientInfo?: BaseClientInfo; // optional for admins
    });

export interface IUser extends Document<Types.ObjectId>, Omit<UserDoc, '_id'> {}

export interface UserModel extends Model<IUser> {
  // statics (these are better as statics than instance methods)
  isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;

  // Return null when not found (more accurate for lookups)
  isUserExistsByEmail(email: string): Promise<IUser | null>;
  checkUserExist(userId: string): Promise<IUser | null>;
}
