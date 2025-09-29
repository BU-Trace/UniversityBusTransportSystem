import { IUserRole } from '../modules/User/user.interface';

export type VerifiedUser = {
  email: string;
  role: IUserRole;
  iat: number;
  exp: number;
};
