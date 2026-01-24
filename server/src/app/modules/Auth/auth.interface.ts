import { UserRole } from '../User/user.utils';

// ---------------------- Login / Auth Request ----------------------
export interface IAuth {
  email: string;
  password: string;
  clientInfo?: {
    device: 'pc' | 'mobile'; // Only 'pc' or 'mobile'
    browser: string; // Browser name
    ipAddress: string; // Client IP
    pcName?: string; // Optional
    os?: string; // Optional OS
    userAgent?: string; // Optional User-Agent
  };
}

// ---------------------- JWT Payload ----------------------
export interface IJwtPayload {
  userId: string;
  name: string;
  email: string;
  role: keyof typeof UserRole; 
  isActive: boolean;
  iat?: number; 
  exp?: number; 
}
