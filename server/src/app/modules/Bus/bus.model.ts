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
      required: true,
    },

    photo: {
      type: String,
      required: true,
      trim: true,
    },

    activeHoursComing: {
      type: [String],
      required: true,
      default: [],
    },

    activeHoursGoing: {
      type: [String],
      required: true,
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Bus = mongoose.model('Bus', BusSchema);
