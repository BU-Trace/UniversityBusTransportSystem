import { Document, Types } from 'mongoose';

export interface IPushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface IPush extends Document {
  user?: Types.ObjectId;
  subscription: IPushSubscription;
  deviceInfo?: string;
}
