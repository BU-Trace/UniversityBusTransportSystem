import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema(
  {
    bus: {
      type: Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['running', 'paused', 'stopped'],
      default: 'running',
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Location = mongoose.model('Location', LocationSchema);
