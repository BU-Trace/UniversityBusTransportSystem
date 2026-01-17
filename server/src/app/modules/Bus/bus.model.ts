import mongoose, { Schema } from 'mongoose';
import { IBus } from './bus.interface';

const BusSchema = new Schema<IBus>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['single-decker', 'double-decker'],
    required: true,
  },
}, {
  timestamps: true,
});

export const Bus = mongoose.model<IBus>('Bus', BusSchema);
