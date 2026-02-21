import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import config from '../config';
import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../modules/User/user.interface';
import User from '../modules/User/user.model';
import AppError from '../errors/appError';
import { email } from 'zod';

interface AuthPayload extends JwtPayload {
  email: string;
  role: UserRole;
  userId?: string;
  name?: string;
  isActive?: boolean;
}

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    // Robust Token Extraction (Header or Cookie fallback)
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.cookies?.accessToken;

    if (!token) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized! Access token missing.');
    }

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as AuthPayload;

      const email = decoded?.email?.trim().toLowerCase();
      if (!email) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token!');
      }
      
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
      }

      if (!user.isActive) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'Your account is not active!');
      }

      // Role authorization check using DB role
      const userRole = String(user.role).toLowerCase();
      const normalizedRequiredRoles = requiredRoles.map((r) => String(r).toLowerCase());

      if (normalizedRequiredRoles.length > 0) {
        // SUPERADMIN Hierarchy: superadmin is allowed on ANY route requiring roles
        const isSuperAdmin = userRole === 'superadmin';
        const hasRequiredRole = normalizedRequiredRoles.includes(userRole);

        if (!isSuperAdmin && !hasRequiredRole) {
          throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
        }
      }

      // Attach user info from DB
      req.user = {
        userId: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        iat: decoded.iat,
        exp: decoded.exp,
      };

      next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return next(
          new AppError(StatusCodes.UNAUTHORIZED, 'Token has expired! Please login again.')
        );
      }
      return next(new AppError(StatusCodes.UNAUTHORIZED, 'Invalid token!'));
    }
  });
};

export default auth;
