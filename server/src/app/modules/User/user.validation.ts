import { z } from 'zod';

const adminProfileValidationSchema = z.object({
  name: z.string().optional(),
  profileImage: z.string().optional(),
});
// DECOMMISSIONED: studentProfileValidationSchema

const driverProfileValidationSchema = z.object({
  name: z.string().optional(),
  profileImage: z.string().optional(),
  clientInfo: z
    .object({
      licenseNumber: z.string().optional(),
    })
    .optional(),
});

const baseClientInfoSchema = z.object({});

// DECOMMISSIONED: studentClientInfoSchema

const driverClientInfoSchema = baseClientInfoSchema.extend({
  licenseNumber: z.string().min(1, 'License number is required'),
});

const clientITInfoSchema = z.object({
  device: z.enum(['pc', 'mobile']).default('pc'),
  browser: z.string().min(1, 'Browser is required'),
  ipAddress: z.string().min(1, 'IP address is required'),
  pcName: z.string().optional(),
  os: z.string().optional(),
  userAgent: z.string().min(1, 'User agent is required'),
});

const baseUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(1, 'Name is required'),

  isActive: z.boolean().default(true),
  lastLogin: z.string().optional(),

  profileImage: z.string().url('Invalid image URL').optional(),

  approvalLetter: z.string().url('Invalid approval letter URL').optional(),
  assignedBus: z.string().optional(),
  assignedBusName: z.string().optional(),
});

export const registerUserSchema = z.discriminatedUnion('role', [
  /*
  baseUserSchema.extend({
    role: z.literal('student'),
    clientInfo: studentClientInfoSchema,
    clientITInfo: clientITInfoSchema,
  }),
*/

  baseUserSchema.extend({
    role: z.literal('driver'),
    clientInfo: driverClientInfoSchema,
    clientITInfo: clientITInfoSchema,

    profileImage: z.string().url('Driver photo is required'),
    approvalLetter: z.string().url('Approval letter is required'),

    assignedBus: z.string().optional(),
    assignedBusName: z.string().optional(),
  }),

  baseUserSchema.extend({
    role: z.enum(['admin', 'superadmin']),
    clientInfo: baseClientInfoSchema.optional(),
    clientITInfo: clientITInfoSchema,

    profileImage: z.string().url('Admin photo is required'),
    approvalLetter: z.string().url('Approval letter is required'),
  }),
]);

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['driver', 'admin', 'superadmin']).optional(),
});

export const customerInfoValidationSchema = z.object({
  phoneNo: z
    .string()
    .regex(/^\d{11}$/, 'Phone number must be exactly 11 digits')
    .optional(),

  gender: z.enum(['Male', 'Female', 'Other']).default('Other').optional(),

  dateOfBirth: z
    .string()
    .optional()
    .refine((value) => !value || !isNaN(Date.parse(value)), 'Invalid date format'),

  address: z.string().optional(),

  photo: z
    .string()
    .regex(/^(https?:\/\/.*\.(?:png|jpg|jpeg))$/, 'Invalid photo URL')
    .optional(),
});

export const adminCreateUserSchema = z.discriminatedUnion('role', [
  /*
  z.object({
    role: z.literal('student'),
...
  }),
*/

  z.object({
    role: z.literal('driver'),
    name: z.string().min(1),
    email: z.string().email(),
    clientInfo: z.object({
      licenseNumber: z.string().min(1),
      bio: z.string().optional(),
    }),
    profileImage: z.string().url(),
    assignedBus: z.string().min(1),
    assignedBusName: z.string().optional(),
    password: z.string().min(6).optional(),
    needPasswordChange: z.boolean().optional(),
  }),

  z.object({
    role: z.enum(['admin', 'superadmin']),
    name: z.string().min(1),
    email: z.string().email(),
    clientInfo: z.object({ bio: z.string().optional() }).optional(),
    profileImage: z.string().url(),
    password: z.string().min(6).optional(),
    needPasswordChange: z.boolean().optional(),
  }),
]);

// Dedicated admin-only driver creation (forces role=driver)
export const adminCreateDriverSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  clientInfo: z.object({
    licenseNumber: z.string().min(1),
    bio: z.string().optional(),
  }),
  profileImage: z.string().url(),
  assignedBus: z.string().min(1),
  assignedBusName: z.string().optional(),
  password: z.string().min(6).optional(),
  needPasswordChange: z.boolean().optional(),
});

export const adminUpdateUserSchema = z.discriminatedUnion('role', [
  /*
  z.object({
    role: z.literal('student'),
...
  }),
*/

  z.object({
    role: z.literal('driver'),
    name: z.string().optional(),
    email: z.string().email().optional(),
    clientInfo: z
      .object({
        licenseNumber: z.string().optional(),
        bio: z.string().optional(),
      })
      .optional(),
    profileImage: z.string().url().optional(),
    approvalLetter: z.string().url().optional(),
    assignedBus: z.string().optional(),
    assignedBusName: z.string().optional(),
  }),

  z.object({
    role: z.enum(['admin', 'superadmin']),
    name: z.string().optional(),
    email: z.string().email().optional(),
    clientInfo: z.object({ bio: z.string().optional() }).optional(),
    profileImage: z.string().url().optional(),
    approvalLetter: z.string().url().optional(),
  }),
]);

export const UserValidation = {
  adminProfileValidationSchema,
  // studentProfileValidationSchema,
  driverProfileValidationSchema,
  registerUserSchema,
  loginUserSchema,
  customerInfoValidationSchema,
  adminCreateUserSchema,
  adminCreateDriverSchema,
  adminUpdateUserSchema,
};
