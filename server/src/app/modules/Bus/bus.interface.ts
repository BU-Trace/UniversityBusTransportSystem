import { Types } from 'mongoose';

export interface IBus {
  _id?: string;

  bus_id?: string;

  name: string;
  plateNumber: string;

  route: Types.ObjectId;

  photo: string;

  activeHoursComing: string[];
  activeHoursGoing: string[];

  isActive?: boolean;
  // mongoose timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
