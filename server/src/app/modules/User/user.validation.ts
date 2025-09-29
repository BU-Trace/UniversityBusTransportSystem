import { z } from 'zod';

// Base client info (common to all)
const baseClientInfoSchema = z.object({
  bio: z.string().optional(),
});

// Student client info
const studentClientInfoSchema = baseClientInfoSchema.extend({
  department: z.string().min(1, 'Department is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
});

// Driver client info
const driverClientInfoSchema = baseClientInfoSchema.extend({
  licenseNumber: z.string().min(1, 'License number is required'),
});

// Core client info used by everyone
const clientITInfoSchema = z.object({
  device: z.enum(['pc', 'mobile']).default('pc'),
  browser: z.string().min(1, 'Browser is required'),
  ipAddress: z.string().min(1, 'IP address is required'),
  pcName: z.string().optional(),
  os: z.string().optional(),
  userAgent: z.string().min(1, 'User agent is required'),
});

// ------------------- User Schemas -------------------

const baseUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),
  isActive: z.boolean().optional().default(true),
  lastLogin: z.string().optional(), // Date string
  profileImage: z.string().url().optional(),
});

// User schema for different roles
const userValidationSchema = z.object({
  body: z.union([
    // Student
    baseUserSchema.extend({
      role: z.literal('student'),
      clientInfo: studentClientInfoSchema,
      clientITInfo: clientITInfoSchema,
    }),
    // Driver
    baseUserSchema.extend({
      role: z.literal('driver'),
      clientInfo: driverClientInfoSchema,
      clientITInfo: clientITInfoSchema,
    }),
    // Admin or SuperAdmin
    baseUserSchema.extend({
      role: z.enum(['admin', 'superadmin']),
      clientInfo: baseClientInfoSchema.optional(),
      clientITInfo: clientITInfoSchema,
    }),
  ]),
});

// ------------------- Customer Info Schema -------------------
const customerInfoValidationSchema = z.object({
  body: z.object({
    phoneNo: z
      .string()
      .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits')
      .optional(),
    gender: z.enum(['Male', 'Female', 'Other']).default('Other').optional(),
    dateOfBirth: z
      .string()
      .optional()
      .refine((value) => !value || !isNaN(Date.parse(value)), {
        message: 'Invalid date format. Must be a valid date.',
      }),
    address: z.string().optional(),
    photo: z
      .string()
      .regex(/^(https?:\/\/.*\.(?:png|jpg|jpeg))$/, 'Invalid photo URL format')
      .optional(),
  }),
});

export const UserValidation = {
  userValidationSchema,
  customerInfoValidationSchema,
};
