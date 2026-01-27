import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import config from "../config";
import catchAsync from "../utils/catchAsync";
import { StatusCodes } from "http-status-codes";
import { UserRole } from "../modules/User/user.interface";
import User from "../modules/User/user.model";
import AppError from "../errors/appError";

interface AuthPayload extends JwtPayload {
  email: string;
  role: UserRole;
  userId?: string;
  name?: string;
  isActive?: boolean;
}

const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    try {
      const decoded = jwt.verify(token, config.jwt_access_secret as string) as AuthPayload;

      const email = decoded?.email?.trim().toLowerCase();
      if (!email) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid token!");
      }

      // ✅ IMPORTANT FIX: don't query by role here
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError(StatusCodes.NOT_FOUND, "This user is not found!");
      }

      if (!user.isActive) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Your account is not active!");
      }

      // ✅ role authorization check using DB role (source of truth)
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      // ✅ attach user info from DB (prevents token/db mismatch issues)
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
          new AppError(StatusCodes.UNAUTHORIZED, "Token has expired! Please login again.")
        );
      }
      return next(new AppError(StatusCodes.UNAUTHORIZED, "Invalid token!"));
    }
  });
};

export default auth;
