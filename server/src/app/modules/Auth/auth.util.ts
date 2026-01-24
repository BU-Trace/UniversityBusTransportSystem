import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { IJwtPayload } from './auth.interface';

// Accept string like '1h', '7d' etc
export const createToken = (
  jwtPayload: IJwtPayload,
  secret: string,
  expiresIn: `${number}${'s' | 'm' | 'h' | 'd'}` | number
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(jwtPayload as object, secret, options);
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
