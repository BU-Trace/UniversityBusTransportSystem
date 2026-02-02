import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

type UserRole = "student" | "driver" | "admin" | "superadmin";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    error?: string;
    user?: DefaultSession["user"] & {
      id?: string;
      role?: UserRole;
      photoUrl?: string; 
    };
  }

  interface User extends DefaultUser {
    role?: UserRole;
    photoUrl?: string; 
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: UserRole | null;
      photoUrl?: string | null; 
    };
    error?: string;
  }
}
