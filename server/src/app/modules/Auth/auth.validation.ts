import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
