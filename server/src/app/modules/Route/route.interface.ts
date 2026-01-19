import { Types } from 'mongoose';

export interface IRoute {
  _id?: string;
  route_id?: string;
  name: string;
  stopages: Types.ObjectId[];  
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  activeHoursComing?: string[];
  activeHoursGoing?: string[];

}
