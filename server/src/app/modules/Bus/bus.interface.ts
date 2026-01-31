import { Types } from 'mongoose';

export interface IBus {
  _id?: string;
  bus_id?: string;
  name: string;
  plateNumber: string;
  route: Types.ObjectId;
  photo: string;
  isActive?: boolean;
  status?: 'running' | 'paused' | 'stopped';
  // mongoose timestamps
  createdAt?: Date;
  updatedAt?: Date;
}
