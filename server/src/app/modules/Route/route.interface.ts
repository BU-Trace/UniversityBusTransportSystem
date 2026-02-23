import { Types } from 'mongoose';

export interface IRoute {
  _id?: string;
  route_id?: string;
  name: string;
  stopages: Types.ObjectId[];
  bus: Types.ObjectId[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  activeHoursComing?: { time: string; bus: Types.ObjectId }[];
  activeHoursGoing?: { time: string; bus: Types.ObjectId }[];
}
// mongoose timestamps
