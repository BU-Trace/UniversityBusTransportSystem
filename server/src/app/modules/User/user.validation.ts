import { z } from 'zod';

/* =========================================================
   Base Client Info (Common)
========================================================= */
const baseClientInfoSchema = z.object({
  bio: z.string().optional(),
});

/* =========================================================
   Student Client Info
========================================================= */
const studentClientInfoSchema = baseClientInfoSchema.extend({
  department: z.string().min(1, 'Department is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
});

/* =========================================================
   Driver Client Info
========================================================= */
const driverClientInfoSchema = baseClientInfoSchema.extend({
  licenseNumber: z.string().min(1, 'License number is required'),
});

/* =========================================================
   Client IT Info (Required for All)
========================================================= */
const clientITInfoSchema = z.object({
  device: z.enum(['pc', 'mobile']).default('pc'),
  browser: z.string().min(1, 'Browser is required'),
  ipAddress: z.string().min(1, 'IP address is required'),
  pcName: z.string().optional(),
  os: z.string().optional(),
  userAgent: z.string().min(1, 'User agent is required'),
});

/* =========================================================
   Base User Schema
========================================================= */
const baseUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().default(true),
  lastLogin: z.string().optional(), // ISO date string
  profileImage: z.string().url('Invalid image URL').optional(),
});

/* =========================================================
   Registration Schema (Full)
========================================================= */
export const registerUserSchema = z.discriminatedUnion('role', [
  /* ---------------- Student ---------------- */
  baseUserSchema.extend({
    role: z.literal('student'),
    clientInfo: studentClientInfoSchema,
    clientITInfo: clientITInfoSchema,
  }),

  /* ---------------- Driver ---------------- */
  baseUserSchema.extend({
    role: z.literal('driver'),
    clientInfo: driverClientInfoSchema,
    clientITInfo: clientITInfoSchema,
  }),

  /* ---------------- Admin / SuperAdmin ---------------- */
  baseUserSchema.extend({
    role: z.enum(['admin', 'superadmin']),
    clientInfo: baseClientInfoSchema.optional(),
    clientITInfo: clientITInfoSchema,
  }),
]);

/* =========================================================
   Login Schema (Minimal)
========================================================= */
export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'driver', 'admin', 'superadmin']).optional(),
});

/* =========================================================
   Customer Info Validation Schema
========================================================= */
export const customerInfoValidationSchema = z.object({
  phoneNo: z
    .string()
    .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits')
    .optional(),

  gender: z.enum(['Male', 'Female', 'Other']).default('Other').optional(),

  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (value) => !value || !isNaN(Date.parse(value)),
      'Invalid date format. Must be a valid date.'
    ),

  address: z.string().optional(),

  photo: z
    .string()
    .regex(/^(https?:\/\/.*\.(?:png|jpg|jpeg))$/, 'Invalid photo URL format')
    .optional(),
});

/* =========================================================
   Export Group
========================================================= */
export const UserValidation = {
  registerUserSchema,
  loginUserSchema,
  customerInfoValidationSchema,
};
