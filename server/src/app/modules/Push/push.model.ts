import { Schema, model } from 'mongoose';
import { IPush } from './push.interface';

const pushSchema = new Schema<IPush>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    subscription: {
      endpoint: { type: String, required: true },
      expirationTime: { type: Number, default: null },
      keys: {
        p256dh: { type: String, required: true },
        auth: { type: String, required: true },
      },
    },
    deviceInfo: { type: String },
  },
  {
    timestamps: true,
  }
);

const Push = model<IPush>('Push', pushSchema);

export default Push;
