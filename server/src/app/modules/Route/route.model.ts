import mongoose, { Schema } from 'mongoose';

const RouteSchema = new Schema({
  activeHoursComing: {
  type: [String],
  default: [],
  },
  activeHoursGoing: {
    type: [String],
    default: [],
  },
  route_id: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  stopages: [{
    type: Schema.Types.ObjectId,
    ref: 'Stopage',
    required: true,
  }],
  bus: [{
    type: Schema.Types.ObjectId,
    ref: 'Bus',
    required: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export const Route = mongoose.model('Route', RouteSchema);
