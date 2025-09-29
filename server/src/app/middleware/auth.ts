import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import config from '../config';
import catchAsync from '../utils/catchAsync';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../modules/User/user.interface';
import User from '../modules/User/user.model';
import AppError from '../errors/appError';

// Define expected payload structure
interface AuthPayload extends JwtPayload {
  email: string;
  role: UserRole;
}

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
    }

    // Support for "Bearer <token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as AuthPayload;

      const { role, email } = decoded;

      // Ensure user exists and active
      const user = await User.findOne({ email, role, isActive: true });
      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, 'This user is not found!');
      }

      // Check role authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authorized!');
      }

      // Attach user info to req.user
      req.user = { ...decoded, role };

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
