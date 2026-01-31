import { Types } from 'mongoose';

export interface ILocation {
  _id?: string;
  bus: Types.ObjectId;
  status: 'running' | 'paused' | 'stopped';
  latitude: number;
  longitude: number;
  capturedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
