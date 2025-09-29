

// ---------------------- User Roles ----------------------
export const USER_ROLES = ['superadmin', 'admin', 'student', 'driver'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type IUserRole = {
  SUPERADMIN: 'superadmin';
  ADMIN: 'admin';
  STUDENT: 'student';
  DRIVER: 'driver';
};

// ---------------------- Client IT Info ----------------------
export type ClientITInfo = {
  device: 'pc' | 'mobile';
  browser: string;
  ipAddress: string;
  pcName?: string;
  os?: string;
  userAgent?: string;
};

// ---------------------- Role-specific Info ----------------------
export type BaseClientInfo = {
  bio?: string;
};

export type StudentClientInfo = BaseClientInfo & {
  department: string;
  rollNumber: string;
};

export type DriverClientInfo = BaseClientInfo & {
  licenseNumber: string;
};

// ---------------------- Frontend User Interface ----------------------
export interface IUser {
  id: string;                     // frontend-friendly id
  email: string;
  name: string;
  role: UserRole;
  clientITInfo: ClientITInfo;

  lastLogin: string;              // ISO string
  isActive: boolean;

  profileImage?: string | null;

  // Optional security-related fields (usually backend-only)
  needPasswordChange?: boolean;

  // Optional role-specific info
  studentInfo?: StudentClientInfo;
  driverInfo?: DriverClientInfo;

  // Timestamps
  createdAt: string;              // ISO string
  updatedAt: string;              // ISO string
}
