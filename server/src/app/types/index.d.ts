/* eslint-disable @typescript-eslint/no-unused-vars */
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        name: string;
        email: string;
        role: 'student' | 'driver' | 'admin' | 'superadmin';
        isActive: boolean;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
