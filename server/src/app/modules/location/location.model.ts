import mongoose, { Schema } from 'mongoose';

const LocationSchema = new Schema(
  {
    busId: { 
      type: String,
      required: true,
      unique: true 
    },
    routeId: { 
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: { 
      type: Number,
      required: true,
    },
    status: { 
      type: String,
      enum: ['running', 'paused', 'stopped'],
      default: 'running'
    },
    time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Location = mongoose.model('Location', LocationSchema);