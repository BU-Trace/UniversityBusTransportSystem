import mongoose, { Schema } from 'mongoose';

const BusSchema = new Schema(
  {
    bus_id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    plateNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      required: false,
      default: null,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    // Photo URL or path
    photo: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'stopped'],
      default: 'running',
    },
  },
  { timestamps: true }
);

export const Bus = mongoose.model('Bus', BusSchema);
